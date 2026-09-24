/**
 * 구글시트(승소사례 목록 + 이미지 목록)를 읽어 Contentful winCase 엔트리와 이미지 Asset을 생성합니다.
 * 여러 번 실행해도 안전합니다(번호 기준으로 이미 있는 사례/이미지는 건너뜀).
 *
 *   node --env-file=.env.local node_modules/.bin/tsx scripts/import-cases.ts            # 전체
 *   node --env-file=.env.local node_modules/.bin/tsx scripts/import-cases.ts --only=269  # 특정 번호만
 *   node --env-file=.env.local node_modules/.bin/tsx scripts/import-cases.ts --limit=5   # 앞에서 N건만 (테스트)
 */
import fs from 'node:fs';
import path from 'node:path';
import { CASE_CATEGORIES, CASE_CONTENT_TYPE_ID, getClient } from './lib/contentful-env';

const SHEET_ID = '1YBCSXdxD9We7qJ-8h5zvxfr6_e9xGrvjmDZkBfaPWd0';
const CASES_GID = '0';
const IMAGES_GID = '606408406';
const STATE_FILE = path.join(process.cwd(), 'scripts', '.import-state.json');
const IMAGE_CONCURRENCY = 3;

type CaseRow = {
  번호: string; 대분류: string; '원본 분류태그': string; 제목: string; 등록일시: string;
  '본문 텍스트': string; '이미지 수': string; '원본 게시글 URL': string;
};
type ImageRow = { 번호: string; 순번: string; 파일명: string; '원본 이미지 URL': string; 상태: string };

interface State {
  assets: Record<string, string>; // "269_01" -> assetId
  entries: Record<string, string>; // "269" -> entryId
  failedImages: Record<string, string>; // "269_01" -> reason
}

// ---------- CSV ----------
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; } else quoted = false;
      } else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      rows.push(row); row = [];
    } else cell += ch;
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row); }
  const header = rows.shift()!.map((h) => h.replace(/^﻿/, '').trim());
  return rows
    .filter((r) => r.some((c) => c.trim() !== ''))
    .map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? '').trim()])));
}

async function fetchSheet(gid: string) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`시트 다운로드 실패 gid=${gid}: ${res.status}`);
  return parseCsv(await res.text());
}

// ---------- helpers ----------
function loadState(): State {
  if (fs.existsSync(STATE_FILE)) return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  return { assets: {}, entries: {}, failedImages: {} };
}
function saveState(s: State) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2));
}

function normalizeCategory(raw: string): (typeof CASE_CATEGORIES)[number] {
  const c = raw.trim();
  return (CASE_CATEGORIES as readonly string[]).includes(c) ? (c as any) : '기타';
}

function cleanTitle(raw: string): string {
  // "[민사] 제목" 또는 "민사] 제목" 형태의 접두 태그 제거
  return raw.replace(/^\[?[^\]\[]{1,20}\]\s*/, '').trim() || raw.trim();
}

function toIsoDate(raw: string): string {
  // "2025-02-26 16:03:52" (KST) -> ISO
  const m = raw.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}(:\d{2})?)/);
  if (m) return `${m[1]}T${m[2].length === 5 ? m[2] + ':00' : m[2]}+09:00`;
  const d = new Date(raw);
  if (!isNaN(d.getTime())) return d.toISOString();
  throw new Error(`날짜 파싱 실패: ${raw}`);
}

function assetTitle(no: string, seq: string) {
  return `승소사례 ${no} - ${seq.padStart(2, '0')}`;
}

async function downloadImage(url: string): Promise<{ buf: ArrayBuffer; contentType: string }> {
  const referer = url.includes('pstatic.net') ? 'https://blog.naver.com/' : 'http://www.xn--6l3bu5ef5an8hvrftsw.com/';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', Referer: referer } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = await res.arrayBuffer();
  if (buf.byteLength < 1000) throw new Error(`파일이 너무 작음 (${buf.byteLength}B)`);
  const ct = res.headers.get('content-type')?.split(';')[0] || (url.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg');
  return { buf, contentType: ct };
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await fn(items[idx]);
      }
    }),
  );
  return out;
}

// ---------- main ----------
async function main() {
  const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')));
  const only = args.only ? String(args.only).split(',') : null;
  const limit = args.limit ? Number(args.limit) : Infinity;

  const { cma, locale } = await getClient();
  console.log(`Contentful 연결 완료 (locale: ${locale})`);

  const [caseRows, imageRows] = (await Promise.all([fetchSheet(CASES_GID), fetchSheet(IMAGES_GID)])) as [CaseRow[], ImageRow[]];
  console.log(`시트: 사례 ${caseRows.length}건, 이미지 ${imageRows.length}장`);

  const imagesByCase = new Map<string, ImageRow[]>();
  for (const img of imageRows) {
    if (!imagesByCase.has(img.번호)) imagesByCase.set(img.번호, []);
    imagesByCase.get(img.번호)!.push(img);
  }
  for (const list of imagesByCase.values()) list.sort((a, b) => Number(a.순번) - Number(b.순번));

  const state = loadState();

  // 이미 Contentful에 있는 엔트리/자산을 스캔해서 state 복구 (state 파일이 지워졌을 때 대비)
  for (let skip = 0; ; skip += 1000) {
    const page = await cma.entry.getMany({ query: { content_type: CASE_CONTENT_TYPE_ID, limit: 1000, skip, select: 'sys.id,fields.caseNumber' } });
    for (const e of page.items) {
      const n = e.fields.caseNumber?.[locale];
      if (n != null) state.entries[String(n)] = e.sys.id;
    }
    if (page.items.length < 1000) break;
  }
  for (let skip = 0; ; skip += 1000) {
    const page = await cma.asset.getMany({ query: { limit: 1000, skip, 'fields.title[match]': '승소사례 ' } });
    for (const a of page.items) {
      const m = String(a.fields.title?.[locale] ?? '').match(/^승소사례 (\d+) - (\d{2})$/);
      if (m) state.assets[`${m[1]}_${m[2]}`] = a.sys.id;
    }
    if (page.items.length < 1000) break;
  }
  saveState(state);
  console.log(`기존: 엔트리 ${Object.keys(state.entries).length}, 자산 ${Object.keys(state.assets).length}`);

  let targets = caseRows
    .filter((r) => /^\d+$/.test(r.번호))
    .sort((a, b) => Number(a.번호) - Number(b.번호));
  if (only) targets = targets.filter((r) => only.includes(r.번호));
  targets = targets.filter((r) => !state.entries[r.번호]).slice(0, limit);
  console.log(`처리 대상: ${targets.length}건\n`);

  let done = 0;
  for (const row of targets) {
    const no = row.번호;
    const imgs = imagesByCase.get(no) ?? [];
    const label = `[${no}] ${cleanTitle(row.제목).slice(0, 40)}`;

    // 1) 이미지 업로드
    const assetIds = await mapLimit(imgs, IMAGE_CONCURRENCY, async (img): Promise<string | null> => {
      const key = `${no}_${img.순번.padStart(2, '0')}`;
      if (state.assets[key]) return state.assets[key];
      if (img.상태 && img.상태 !== 'OK') {
        state.failedImages[key] = `시트 상태: ${img.상태}`;
        return null;
      }
      try {
        const { buf, contentType } = await downloadImage(img['원본 이미지 URL']);
        const ext = contentType === 'image/png' ? 'png' : 'jpg';
        let asset = await cma.asset.createFromFiles({}, {
          fields: {
            title: { [locale]: assetTitle(no, img.순번) },
            description: { [locale]: `${cleanTitle(row.제목)} (판결문 ${img.순번}/${imgs.length})` },
            file: { [locale]: { contentType, fileName: `case-${no}-${img.순번.padStart(2, '0')}.${ext}`, file: buf } },
          },
        });
        asset = await cma.asset.processForAllLocales({}, asset, { processingCheckWait: 1500, processingCheckRetries: 20 });
        asset = await cma.asset.publish({ assetId: asset.sys.id }, asset);
        state.assets[key] = asset.sys.id;
        delete state.failedImages[key];
        saveState(state);
        return asset.sys.id;
      } catch (e: any) {
        state.failedImages[key] = String(e?.message ?? e);
        saveState(state);
        console.warn(`   ⚠ 이미지 실패 ${key}: ${state.failedImages[key]}`);
        return null;
      }
    });
    const links = assetIds.filter((id): id is string => !!id).map((id) => ({ sys: { type: 'Link', linkType: 'Asset', id } }));

    // 2) 엔트리 생성 + publish
    try {
      let entry = await cma.entry.create({ contentTypeId: CASE_CONTENT_TYPE_ID }, {
        fields: {
          caseNumber: { [locale]: Number(no) },
          title: { [locale]: cleanTitle(row.제목).slice(0, 256) },
          slug: { [locale]: `case-${no}` },
          category: { [locale]: normalizeCategory(row.대분류) },
          originalTag: { [locale]: row['원본 분류태그'] || undefined },
          publishedAt: { [locale]: toIsoDate(row.등록일시) },
          summary: { [locale]: row['본문 텍스트'] || undefined },
          images: { [locale]: links },
          sourceUrl: { [locale]: row['원본 게시글 URL'] || undefined },
        },
      });
      entry = await cma.entry.publish({ entryId: entry.sys.id }, entry);
      state.entries[no] = entry.sys.id;
      saveState(state);
      done++;
      console.log(`✓ ${label} (이미지 ${links.length}/${imgs.length}) [${done}/${targets.length}]`);
    } catch (e: any) {
      console.error(`✗ ${label} 엔트리 실패:`, e?.message ?? e);
    }
  }

  const failed = Object.entries(state.failedImages);
  console.log(`\n완료: 엔트리 ${done}건 생성. 누적 엔트리 ${Object.keys(state.entries).length}, 자산 ${Object.keys(state.assets).length}`);
  if (failed.length) {
    console.log(`실패 이미지 ${failed.length}장:`);
    for (const [k, v] of failed) console.log(`  - ${k}: ${v}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
