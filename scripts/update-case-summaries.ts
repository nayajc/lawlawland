/**
 * 승소사례 요약/상세 텍스트를 Contentful winCase 엔트리에 일괄 반영합니다.
 *
 *   node --env-file=.env.local node_modules/.bin/tsx scripts/update-case-summaries.ts <input.json> [--only=1,2] [--dry]
 *
 * input.json: [{ "no": 269, "summary": "짧은 요약", "caseDetail": "[사건] ...", "slug": "divorce-custody-269" }, ...]
 *   - summary / caseDetail / slug 중 있는 필드만 갱신합니다. 값이 기존과 같으면 건너뜁니다.
 */
import fs from 'node:fs';
import type { EntryProps } from 'contentful-management';
import { CASE_CONTENT_TYPE_ID, getClient } from './lib/contentful-env';

interface Row { no: number; summary?: string; caseDetail?: string; slug?: string }

const CONCURRENCY = 3;

async function mapLimit<T>(items: T[], limit: number, fn: (item: T) => Promise<void>) {
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) await fn(items[i++]);
  }));
}

async function main() {
  const [inputPath, ...rest] = process.argv.slice(2);
  if (!inputPath) throw new Error('입력 JSON 경로가 필요합니다.');
  const args = Object.fromEntries(rest.map((a) => a.replace(/^--/, '').split('=')));
  const only = args.only ? new Set(String(args.only).split(',').map(Number)) : null;
  const dry = 'dry' in args;

  let rows: Row[] = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  if (only) rows = rows.filter((r) => only.has(r.no));
  const byNo = new Map(rows.map((r) => [r.no, r]));

  const { cma, locale } = await getClient();

  // 대상 엔트리 전부 조회
  const entries: EntryProps[] = [];
  for (let skip = 0; ; skip += 100) {
    const page = await cma.entry.getMany({ query: { content_type: CASE_CONTENT_TYPE_ID, limit: 100, skip } });
    entries.push(...page.items);
    if (page.items.length < 100) break;
  }
  const targets = entries.filter((e) => byNo.has(Number(e.fields.caseNumber?.[locale])));
  console.log(`입력 ${rows.length}건, 매칭 엔트리 ${targets.length}건${dry ? ' (dry-run)' : ''}\n`);

  let updated = 0, skipped = 0, failed = 0;
  await mapLimit(targets, CONCURRENCY, async (entry) => {
    const no = Number(entry.fields.caseNumber[locale]);
    const row = byNo.get(no)!;
    const changes: string[] = [];
    for (const key of ['summary', 'caseDetail', 'slug'] as const) {
      const val = row[key]?.trim();
      if (!val) continue;
      if (entry.fields[key]?.[locale] === val) continue;
      entry.fields[key] = { [locale]: val };
      changes.push(key);
    }
    if (changes.length === 0) { skipped++; return; }
    if (dry) { console.log(`  [${no}] would update ${changes.join(', ')}`); updated++; return; }
    try {
      const saved = await cma.entry.update({ entryId: entry.sys.id }, entry);
      await cma.entry.publish({ entryId: entry.sys.id }, saved);
      updated++;
      if (updated % 20 === 0) console.log(`  ... ${updated}건 갱신`);
    } catch (e) {
      failed++;
      console.error(`  ✗ [${no}] ${e instanceof Error ? e.message : String(e)}`);
    }
  });

  console.log(`\n완료: 갱신 ${updated}, 변경없음 ${skipped}, 실패 ${failed}`);
  const missing = rows.filter((r) => !targets.some((e) => Number(e.fields.caseNumber[locale]) === r.no));
  if (missing.length) console.log(`엔트리 없는 번호: ${missing.map((m) => m.no).join(', ')}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
