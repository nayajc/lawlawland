import { unstable_cache } from 'next/cache';
import { getAllBlogPosts } from '@/lib/contentful/client';
import type { BlogPostListItem, WinCase, WinCaseListItem } from '@/types';

/** 한글 단어(2자 이상)만 뽑고, 사례 제목에 흔한 결과 표현은 제외한다. */
const STOPWORDS = new Set(['승소', '판결', '인용', '기각', '청구', '사건', '항소', '전부', '일부', '확정', '결정', '인정', '받아', '받은', '통해', '이루어', '이후', '대한', '관련']);

function tokens(text: string): Set<string> {
  const out = new Set<string>();
  for (const w of text.match(/[가-힣]{2,}/g) ?? []) if (!STOPWORDS.has(w)) out.add(w);
  return out;
}

/**
 * 같은 분야 안에서 제목·요약 단어가 많이 겹치는 사례를 고른다.
 * 점수가 같은 사례끼리는 사례 번호로 순서를 돌려, 모든 페이지가 같은 사례만 가리키지 않게 한다.
 */
export function pickRelatedCases(current: WinCase, all: WinCaseListItem[], limit = 4): WinCaseListItem[] {
  const base = tokens(`${current.title} ${current.summary ?? ''}`);
  const scored = all
    .filter((c) => c.slug !== current.slug && c.category === current.category)
    .map((c) => {
      let shared = 0;
      for (const t of tokens(`${c.title} ${c.summary ?? ''}`)) if (base.has(t)) shared += 1;
      return { c, shared };
    });
  const best = scored.filter((s) => s.shared > 0).sort((a, b) => b.shared - a.shared || b.c.caseNumber - a.c.caseNumber).slice(0, limit * 3);
  const pool = best.length >= limit ? best : [...best, ...scored.filter((s) => s.shared === 0)].slice(0, Math.max(limit * 3, limit));
  const start = pool.length > 0 ? current.caseNumber % pool.length : 0;
  const rotated = [...pool.slice(start), ...pool.slice(0, start)];
  return rotated.slice(0, limit).map((s) => s.c);
}

/** 사례 주제 → 연결할 블로그 글. 사실상 이혼·가사·상속·보전 주제만 대응하는 글이 있다. */
const TOPICS: { re: RegExp; category?: string; slug?: string }[] = [
  { re: /상속|유류분|inheritance|기여분/, category: '상속' },
  { re: /양육|친권|면접교섭|child/, category: '양육권' },
  { re: /재산분할|property-division/, category: '재산분할' },
  { re: /위자료|상간|alimony|affair|부정행위/, category: '위자료' },
  { re: /이혼|divorce|사실혼|de-facto/, category: '이혼절차' },
  { re: /가압류|가처분|보전|압류|집행정지|강제집행|provisional|garnish|compulsory|execution/, slug: 'munjeong-provisional-seizure-protect-assets' },
];

const getBlogPostsCached = unstable_cache(async () => getAllBlogPosts(), ['related-blog-posts'], { revalidate: 3600 });

export async function pickRelatedPosts(current: WinCase, limit = 2): Promise<BlogPostListItem[]> {
  const haystack = `${current.title} ${current.summary ?? ''} ${current.slug} ${current.originalTag ?? ''}`;
  const topic = TOPICS.find((t) => t.re.test(haystack));
  if (!topic) return [];
  const posts = await getBlogPostsCached();
  const matched = topic.slug ? posts.filter((p) => p.slug === topic.slug) : posts.filter((p) => p.category === topic.category);
  if (matched.length === 0) return [];
  // 최신 글이 모든 사례에 몰리지 않도록 사례 번호로 시작 위치를 돌린다
  const start = current.caseNumber % matched.length;
  return [...matched.slice(start), ...matched.slice(0, start)].slice(0, limit);
}
