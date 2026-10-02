/**
 * 송파구·문정동 키워드 블로그 10편 제작 파이프라인.
 *
 *   node --env-file=.env.local node_modules/.bin/tsx scripts/blog/run.ts validate
 *   node --env-file=.env.local node_modules/.bin/tsx scripts/blog/run.ts images [--only=slug]
 *   node --env-file=.env.local node_modules/.bin/tsx scripts/blog/run.ts upload            # Contentful에 초안(draft)으로 생성
 *   node --env-file=.env.local node_modules/.bin/tsx scripts/blog/run.ts publish           # 초안을 publish (publishedAt이 미래면 사이트에 그 날짜까지 노출 안 됨)
 *
 * 모든 단계는 재실행해도 안전합니다 (이미지는 파일이 있으면 건너뛰고, 업로드는 slug 기준 upsert).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { snippetDescription } from '../../src/lib/seo';
import { getClient } from '../lib/contentful-env';
import { BLOG_CONTENT_TYPE_ID, IMAGES_DIR, loadPosts, markdownToRichText, type PostSource } from './lib';

const GEMINI_MODEL = 'gemini-3.1-flash-image';
const REF_IMAGES = process.env.BLOG_REF_IMAGES?.split(',') ?? [];

const STYLE_PROMPT = `Create a square 1:1 cover illustration for a Korean law firm's blog, in EXACTLY the same visual style as the attached reference images.
Style rules: flat minimal vector-like shapes with rounded corners, subtle soft shading, layered paper-cut feel, calm and trustworthy mood.
Palette: dusty light blue, warm cream, sand/peach, muted teal and soft grey-blue only. Plain soft pastel background with a gentle glow.
Strictly NO text, NO letters, NO numbers, NO logos, NO human faces, NO photographs. A single clear central symbol with generous empty space around it.
Subject: `;

function arg(name: string) {
  return process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
}

function validate(posts: PostSource[]) {
  let bad = 0;
  const slugs = new Set<string>();
  for (const p of posts) {
    const issues: string[] = [];
    const desc = snippetDescription(p.excerpt, p.title);
    const body = p.body;
    const chars = body.replace(/\s+/g, '').length;
    if (slugs.has(p.slug)) issues.push('slug 중복');
    slugs.add(p.slug);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)) issues.push('slug 형식');
    if (p.title.length < 5 || p.title.length > 100) issues.push(`title 길이 ${p.title.length}`);
    if (p.excerpt.length < 20 || p.excerpt.length > 300) issues.push(`excerpt 길이 ${p.excerpt.length}`);
    if (!/(송파구|문정동)/.test(p.title)) issues.push('title에 키워드 없음');
    if (!/(송파구 변호사|문정동 변호사)/.test(body)) issues.push('본문에 "송파구 변호사/문정동 변호사" 없음');
    if (!body.includes('자주 묻는 질문')) issues.push('FAQ 섹션 없음');
    if (chars < 1100) issues.push(`본문 짧음(${chars}자)`);
    if (!['이혼절차', '재산분할', '양육권', '위자료', '법률상식', '승소사례'].includes(p.category)) issues.push('category');
    if (Number.isNaN(Date.parse(p.publishedAt))) issues.push('publishedAt');
    const kw = (body.match(/송파구 변호사|문정동 변호사/g) ?? []).length;
    console.log(`${issues.length ? '✗' : '✓'} ${p.file}  제목${p.title.length}자 본문${chars}자 키워드${kw}회 | meta: ${desc.length}자 "${desc}"${issues.length ? '\n    ' + issues.join(', ') : ''}`);
    if (issues.length) bad++;
  }
  // 내부 링크 검증
  const known = new Set(posts.map((p) => p.slug));
  for (const p of posts) {
    for (const m of p.body.matchAll(/\]\(\/blog\/([^)]+)\)/g)) {
      if (!known.has(m[1])) console.log(`  (참고) ${p.file}: 기존 글 링크 /blog/${m[1]} — 실존 여부 확인 필요`);
    }
  }
  if (bad) process.exitCode = 1;
}

async function generateImage(prompt: string, refs: { mime: string; data: string }[]): Promise<Buffer> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY 필요');
  const parts = [
    ...refs.map((r) => ({ inlineData: { mimeType: r.mime, data: r.data } })),
    { text: STYLE_PROMPT + prompt },
  ];
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '1:1' } },
    }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 500)}`);
  const json: any = await res.json();
  const img = json.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)?.inlineData;
  if (!img) throw new Error('이미지 응답 없음: ' + JSON.stringify(json).slice(0, 500));
  return Buffer.from(img.data, 'base64');
}

async function images(posts: PostSource[]) {
  if (REF_IMAGES.length === 0) throw new Error('BLOG_REF_IMAGES=ref1.png,ref2.png 로 레퍼런스 이미지 경로를 지정하세요.');
  const refs = REF_IMAGES.map((p) => ({ mime: 'image/png', data: readFileSync(p).toString('base64') }));
  mkdirSync(IMAGES_DIR, { recursive: true });
  const only = arg('only');
  for (const p of posts) {
    if (only && p.slug !== only) continue;
    const out = path.join(IMAGES_DIR, `${p.slug}-cover.png`);
    if (existsSync(out)) { console.log(`skip ${p.slug} (이미 있음)`); continue; }
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        writeFileSync(out, await generateImage(p.imagePrompt, refs));
        console.log(`생성 ${p.slug}`);
        break;
      } catch (e) {
        console.error(`  실패(${attempt}/3) ${p.slug}:`, (e as Error).message);
        if (attempt === 3) process.exitCode = 1;
      }
    }
  }
}

async function upload(posts: PostSource[]) {
  const { cma, locale } = await getClient();
  const L = <T,>(v: T) => ({ [locale]: v });

  for (const p of posts) {
    const imgPath = path.join(IMAGES_DIR, `${p.slug}-cover.png`);
    if (!existsSync(imgPath)) throw new Error(`이미지 없음: ${imgPath} (먼저 images 실행)`);

    const existing = await cma.entry.getMany({ query: { content_type: BLOG_CONTENT_TYPE_ID, 'fields.slug': p.slug, limit: 1 } });
    const prev = existing.items[0];

    // 커버 이미지 에셋: 기존 엔트리가 있으면 재사용
    let assetId: string | undefined = (prev?.fields as any)?.coverImage?.[locale]?.sys?.id;
    if (!assetId) {
      const buf = readFileSync(imgPath);
      const up = await cma.upload.create({}, { file: buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer });
      let asset = await cma.asset.create({}, {
        fields: {
          title: L(p.title),
          description: L(p.imageAlt),
          file: L({
            contentType: 'image/png',
            fileName: `${p.slug}-cover.png`,
            uploadFrom: { sys: { type: 'Link', linkType: 'Upload', id: up.sys.id } },
          }),
        },
      });
      asset = await cma.asset.processForAllLocales({}, asset);
      for (let i = 0; i < 20; i++) {
        asset = await cma.asset.get({ assetId: asset.sys.id });
        if ((asset.fields.file as any)?.[locale]?.url) break;
        await new Promise((r) => setTimeout(r, 1500));
      }
      asset = await cma.asset.publish({ assetId: asset.sys.id }, asset);
      assetId = asset.sys.id;
    }

    const fields = {
      slug: L(p.slug),
      title: L(p.title),
      excerpt: L(p.excerpt),
      content: L(markdownToRichText(p.body)),
      author: L('오수진'),
      publishedAt: L(p.publishedAt),
      coverImage: L({ sys: { type: 'Link', linkType: 'Asset', id: assetId } }),
      category: L(p.category),
      tags: L(p.tags),
    };

    if (prev) {
      await cma.entry.update({ entryId: prev.sys.id }, { ...prev, fields } as any);
      console.log(`갱신(초안 상태 유지/변경) ${p.slug}`);
    } else {
      await cma.entry.create({ contentTypeId: BLOG_CONTENT_TYPE_ID }, { fields } as any);
      console.log(`생성(초안) ${p.slug}`);
    }
  }
}

async function publish(posts: PostSource[]) {
  const { cma } = await getClient();
  for (const p of posts) {
    const res = await cma.entry.getMany({ query: { content_type: BLOG_CONTENT_TYPE_ID, 'fields.slug': p.slug, limit: 1 } });
    const entry = res.items[0];
    if (!entry) { console.log(`없음 ${p.slug} (upload 먼저)`); continue; }
    await cma.entry.publish({ entryId: entry.sys.id }, entry);
    console.log(`publish ${p.slug} → 노출 시작 ${p.publishedAt}`);
  }
}

async function main() {
  const cmd = process.argv[2];
  const posts = loadPosts();
  if (cmd === 'validate') return validate(posts);
  if (cmd === 'images') return images(posts);
  if (cmd === 'upload') return upload(posts);
  if (cmd === 'publish') return publish(posts);
  console.log('usage: run.ts <validate|images|upload|publish>');
}

main().catch((e) => { console.error(e); process.exit(1); });
