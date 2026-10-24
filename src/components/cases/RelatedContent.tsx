import Link from 'next/link';
import { getAllWinCases } from '@/lib/contentful/cases';
import { pickRelatedCases, pickRelatedPosts } from '@/lib/related-content';
import type { WinCase } from '@/types';

/** 승소사례 상세 하단: 변호사 안내 + 관련 글 + 관련 사례 (내부 링크와 맥락 텍스트 제공) */
export async function RelatedContent({ current }: { current: WinCase }) {
  const [all, posts] = await Promise.all([getAllWinCases(), pickRelatedPosts(current)]);
  const related = pickRelatedCases(current, all);

  return (
    <div className="mt-10 space-y-10">
      <section aria-label="수행 변호사" className="rounded-xl border p-5 text-sm leading-relaxed" style={{ borderColor: '#D4E4F0', color: '#1B2840' }}>
        <h2 className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#5C6F8A' }}>수행 변호사</h2>
        <p>
          이 사건은 법무법인 큐브 서울사무소 오수진 변호사가 대리한 {current.category} 사건입니다. 비슷한 사건의 진행 방향이 궁금하시면{' '}
          <Link href="/about" className="underline">변호사 소개</Link>를 확인하시거나 <Link href="/consult" className="underline">상담을 신청</Link>해 주세요.
          판결 결과는 개별 사건의 증거와 사정에 따라 달라지며, 이 사례가 같은 결과를 보장하는 것은 아닙니다.
        </p>
      </section>

      {posts.length > 0 && (
        <section aria-label="함께 읽으면 좋은 글">
          <h2 className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#5C6F8A' }}>함께 읽으면 좋은 글</h2>
          <ul className="space-y-3">
            {posts.map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`} className="block rounded-xl border p-4 hover:shadow-md transition-all" style={{ borderColor: '#D4E4F0' }}>
                  <p className="text-sm font-semibold" style={{ color: '#1B2840' }}>{p.title}</p>
                  <p className="text-xs mt-1 line-clamp-2" style={{ color: '#5C6F8A' }}>{p.excerpt}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {related.length > 0 && (
        <section aria-label="관련 승소사례">
          <h2 className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#5C6F8A' }}>관련 {current.category} 승소사례</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {related.map((c) => (
              <li key={c.slug}>
                <Link href={`/cases/${c.slug}`} className="block h-full rounded-xl border p-4 hover:shadow-md transition-all" style={{ borderColor: '#D4E4F0' }}>
                  <p className="text-sm font-semibold line-clamp-2" style={{ color: '#1B2840' }}>{c.title}</p>
                  {c.summary && <p className="text-xs mt-1 line-clamp-3" style={{ color: '#5C6F8A' }}>{c.summary}</p>}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
