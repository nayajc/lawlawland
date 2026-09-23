import Link from 'next/link';
import type { Metadata } from 'next';
import { ChevronRight, Images } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { CaseCategoryBadge } from '@/components/cases/CaseCategoryBadge';
import { getAllWinCases, isWinCaseCategory, WIN_CASE_CATEGORIES } from '@/lib/contentful/cases';

export const metadata: Metadata = {
  title: '주요 승소사례 - 오수진 변호사',
  description: '이혼전문변호사 오수진의 주요 승소 판결 사례. 가사, 민사, 보전·집행, 행정, 형사 등 분야별 판결문과 사건 요약.',
  alternates: { canonical: '/cases' },
};

export const revalidate = 3600;

interface CasesPageProps {
  searchParams: Promise<{ category?: string }>;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default async function CasesPage({ searchParams }: CasesPageProps) {
  const { category } = await searchParams;
  const selected = isWinCaseCategory(category) ? category : null;

  const all = await getAllWinCases();
  const counts = new Map<string, number>();
  for (const c of all) counts.set(c.category, (counts.get(c.category) ?? 0) + 1);
  const cases = selected ? all.filter((c) => c.category === selected) : all;

  const listJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '오수진 변호사 주요 승소사례',
    url: 'https://ohsoojin.com/cases',
    description: metadata.description,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: all.length,
      itemListElement: all.slice(0, 50).map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `https://ohsoojin.com/cases/${c.slug}`,
        name: c.title,
      })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listJsonLd) }} />
      <PageHeader
        title="주요 승소사례"
        description={all.length > 0 ? `오수진 변호사의 주요 승소 판결 사례입니다. 총 ${all.length}건` : '오수진 변호사의 주요 승소 판결 사례입니다.'}
      />
      <div className="max-w-3xl mx-auto px-4 pb-12">
        {/* 분류 필터 */}
        <nav aria-label="분류" className="flex flex-wrap gap-2 mb-6">
          <FilterChip href="/cases" active={!selected} label={`전체 ${all.length}`} />
          {WIN_CASE_CATEGORIES.filter((cat) => counts.get(cat)).map((cat) => (
            <FilterChip
              key={cat}
              href={`/cases?category=${encodeURIComponent(cat)}`}
              active={selected === cat}
              label={`${cat} ${counts.get(cat)}`}
            />
          ))}
        </nav>

        {cases.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg" style={{ color: '#5C6F8A' }}>등록된 승소사례가 없습니다.</p>
          </div>
        ) : (
          <ol className="space-y-2">
            {cases.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/cases/${c.slug}`}
                  className="group block rounded-xl border bg-white p-4 hover:shadow-md transition-all"
                  style={{ borderColor: '#D4E4F0' }}
                >
                  <div className="flex items-start gap-3">
                    <CaseCategoryBadge category={c.category} className="shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h2 className="text-sm font-medium leading-snug" style={{ color: '#1B2840' }}>
                        {c.title}
                      </h2>
                      <p className="flex items-center gap-2 text-xs mt-1" style={{ color: '#5C6F8A' }}>
                        <time dateTime={c.publishedAt}>{formatDate(c.publishedAt)}</time>
                        {c.imageCount > 0 && (
                          <span className="inline-flex items-center gap-0.5">
                            <Images className="w-3 h-3" aria-hidden />
                            판결문 {c.imageCount}장
                          </span>
                        )}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 shrink-0 mt-1 opacity-40 group-hover:opacity-80 transition-opacity" style={{ color: '#5C6F8A' }} aria-hidden />
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
    </>
  );
}

function FilterChip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? 'page' : undefined}
      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${active ? 'font-semibold' : 'hover:bg-[#f0f7fc]'}`}
      style={active
        ? { backgroundColor: '#1B2E4B', color: '#fff', borderColor: '#1B2E4B' }
        : { backgroundColor: '#fff', color: '#5C6F8A', borderColor: '#D4E4F0' }}
    >
      {label}
    </Link>
  );
}
