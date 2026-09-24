import { notFound, permanentRedirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, ArrowRight, MessageCircle } from 'lucide-react';
import { CaseCategoryBadge } from '@/components/cases/CaseCategoryBadge';
import { getAdjacentWinCases, getAllWinCaseSlugs, getWinCaseBySlug, getWinCaseSlugByNumber, parseCaseDetail } from '@/lib/contentful/cases';
import { DEFAULT_OG_IMAGE, snippetDescription, truncateTitle } from '@/lib/seo';

interface CasePageProps {
  params: Promise<{ slug: string }>;
}

const SITE = 'https://ohsoojin.com';

export const revalidate = 3600;

// 빌드 시에는 최신 30건만 미리 생성. 나머지는 첫 방문 때 생성 후 ISR 캐시 (Contentful 호출 제한 회피).
export async function generateStaticParams() {
  const slugs = await getAllWinCaseSlugs();
  return slugs.slice(0, 30).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: CasePageProps): Promise<Metadata> {
  const { slug } = await params;
  const c = await getWinCaseBySlug(slug);
  if (!c) return { title: '승소사례를 찾을 수 없습니다 - 오수진 변호사' };

  const description = snippetDescription(
    c.summary,
    `[${c.category}] ${c.title} - 이혼전문변호사 오수진의 승소 판결 사례와 판결문.`,
  );
  const shortTitle = truncateTitle(c.title, 38);

  return {
    title: `${c.category} 승소사례 | ${shortTitle} - 오수진 변호사`,
    description,
    alternates: { canonical: `/cases/${slug}` },
    openGraph: {
      type: 'article',
      title: `[${c.category} 승소사례] ${c.title}`,
      description,
      url: `${SITE}/cases/${slug}`,
      publishedTime: c.publishedAt,
      section: c.category,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: { card: 'summary_large_image', title: `[${c.category} 승소사례] ${shortTitle}`, description, images: [DEFAULT_OG_IMAGE.url] },
  };
}

export default async function CasePage({ params }: CasePageProps) {
  const { slug } = await params;
  const c = await getWinCaseBySlug(slug);
  if (!c) {
    // 예전 주소 /cases/case-269 → 새 slug로 301
    const legacy = slug.match(/^case-(\d+)$/);
    if (legacy) {
      const current = await getWinCaseSlugByNumber(Number(legacy[1]));
      if (current && current !== slug) permanentRedirect(`/cases/${current}`);
    }
    notFound();
  }

  const { prev, next } = await getAdjacentWinCases(c.caseNumber);
  const detailSections = parseCaseDetail(c.caseDetail);
  const formattedDate = new Date(c.publishedAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: c.title,
      description: c.summary ?? `[${c.category}] ${c.title}`,
      articleBody: c.caseDetail ? detailSections.map((s) => `${s.label}: ${s.text}`).join('\n') : undefined,
      articleSection: c.category,
      keywords: [c.category, c.originalTag, '승소사례', '오수진 변호사'].filter(Boolean).join(', '),
      image: c.images.map((img) => img.url),
      datePublished: c.publishedAt,
      dateModified: c.publishedAt,
      author: { '@type': 'Person', name: '오수진', jobTitle: '변호사', url: `${SITE}/about` },
      publisher: { '@type': 'LegalService', name: '오수진 변호사', url: SITE, logo: { '@type': 'ImageObject', url: `${SITE}/lawyer-profile.png` } },
      mainEntityOfPage: `${SITE}/cases/${c.slug}`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: SITE },
        { '@type': 'ListItem', position: 2, name: '승소사례', item: `${SITE}/cases` },
        { '@type': 'ListItem', position: 3, name: c.title, item: `${SITE}/cases/${c.slug}` },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="max-w-3xl mx-auto px-4 py-8 pb-16">
        <Link
          href={`/cases?category=${encodeURIComponent(c.category)}`}
          className="inline-flex items-center gap-1 text-sm mb-6 transition-colors hover:underline"
          style={{ color: '#5C6F8A' }}
        >
          <ArrowLeft className="w-4 h-4" aria-hidden />
          {c.category} 승소사례 목록
        </Link>

        <header className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <CaseCategoryBadge category={c.category} />
            {c.originalTag && c.originalTag !== c.category && (
              <span className="text-xs" style={{ color: '#5C6F8A' }}>{c.originalTag}</span>
            )}
          </div>
          <h1 className="text-xl md:text-2xl font-bold leading-snug" style={{ color: '#1B2840' }}>
            {c.title}
          </h1>
          <p className="text-sm mt-3" style={{ color: '#5C6F8A' }}>
            <time dateTime={c.publishedAt}>{formattedDate}</time>
            <span className="mx-2">·</span>
            사례 No.{c.caseNumber}
          </p>
        </header>

        {c.summary && (
          <section
            className="rounded-xl border p-5 mb-6 text-[15px] leading-relaxed"
            style={{ borderColor: '#D4E4F0', backgroundColor: '#f7fbfe', color: '#1B2840' }}
          >
            <h2 className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#5C6F8A' }}>사건 요약</h2>
            <p>{c.summary}</p>
          </section>
        )}

        {detailSections.length > 0 && (
          <section className="mb-8" aria-label="사건 상세">
            <h2 className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#5C6F8A' }}>사건 상세</h2>
            <dl className="rounded-xl border divide-y" style={{ borderColor: '#D4E4F0' }}>
              {detailSections.map((s) => (
                <div key={s.label} className="grid grid-cols-[3.5rem_1fr] gap-3 p-4" style={{ borderColor: '#D4E4F0' }}>
                  <dt className="text-sm font-semibold" style={{ color: '#1B2E4B' }}>{s.label}</dt>
                  <dd className="text-[15px] leading-relaxed" style={{ color: '#1B2840' }}>{s.text}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <section aria-label="판결문">
          <h2 className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#5C6F8A' }}>
            판결문 {c.images.length > 0 && `(${c.images.length}장)`}
          </h2>
          {c.images.length === 0 ? (
            <p className="text-sm" style={{ color: '#5C6F8A' }}>판결문 이미지가 준비 중입니다.</p>
          ) : (
            <div className="space-y-4">
              {c.images.map((img, i) => (
                <figure key={img.url} className="rounded-xl border overflow-hidden bg-white" style={{ borderColor: '#D4E4F0' }}>
                  <Image
                    src={img.url}
                    alt={img.description ?? `${c.title} 판결문 ${i + 1}`}
                    width={img.width}
                    height={img.height}
                    sizes="(max-width: 768px) 100vw, 768px"
                    className="w-full h-auto"
                    priority={i === 0}
                  />
                </figure>
              ))}
            </div>
          )}
          <p className="text-xs mt-3" style={{ color: '#5C6F8A' }}>
            판결문의 개인정보는 비식별 처리되어 있습니다.
          </p>
        </section>

        {/* 상담 유도 */}
        <aside className="mt-10 rounded-2xl p-6 text-center" style={{ backgroundColor: '#1B2E4B' }}>
          <p className="text-white font-semibold">비슷한 상황이신가요?</p>
          <p className="text-sm mt-1 mb-4" style={{ color: '#c4ddf0' }}>사건 내용을 남겨주시면 오수진 변호사가 직접 검토합니다.</p>
          <Link
            href="/consult"
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ color: '#1B2E4B' }}
          >
            <MessageCircle className="w-4 h-4" aria-hidden />
            상담 신청하기
          </Link>
        </aside>

        {/* 이전/다음 */}
        {(prev || next) && (
          <nav aria-label="다른 승소사례" className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {prev ? (
              <Link href={`/cases/${prev.slug}`} className="rounded-xl border p-4 hover:shadow-md transition-all" style={{ borderColor: '#D4E4F0' }}>
                <span className="inline-flex items-center gap-1 text-xs mb-1" style={{ color: '#5C6F8A' }}>
                  <ArrowLeft className="w-3 h-3" aria-hidden /> 이전 사례
                </span>
                <p className="text-sm font-medium line-clamp-2" style={{ color: '#1B2840' }}>{prev.title}</p>
              </Link>
            ) : <span />}
            {next && (
              <Link href={`/cases/${next.slug}`} className="rounded-xl border p-4 hover:shadow-md transition-all sm:text-right" style={{ borderColor: '#D4E4F0' }}>
                <span className="inline-flex items-center gap-1 text-xs mb-1" style={{ color: '#5C6F8A' }}>
                  다음 사례 <ArrowRight className="w-3 h-3" aria-hidden />
                </span>
                <p className="text-sm font-medium line-clamp-2" style={{ color: '#1B2840' }}>{next.title}</p>
              </Link>
            )}
          </nav>
        )}
      </article>
    </>
  );
}
