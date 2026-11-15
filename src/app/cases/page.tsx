import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { CasesList, CasesListView, type CasesListItem } from '@/components/cases/CasesList';
import { getAllWinCases, WIN_CASE_CATEGORIES } from '@/lib/contentful/cases';

export const metadata: Metadata = {
  title: '주요 승소사례 - 오수진 변호사',
  description: '이혼전문변호사 오수진의 주요 승소 판결 사례. 가사, 민사, 보전·집행, 행정, 형사 등 분야별 판결문과 사건 요약.',
  alternates: { canonical: '/cases' },
};

// searchParams를 읽지 않으므로 정적(ISR) 페이지. 하루 1회만 다시 만든다.
export const revalidate = 86400;

export default async function CasesPage() {
  const all = await getAllWinCases();
  const items: CasesListItem[] = all.map(({ slug, title, category, publishedAt, imageCount }) => ({ slug, title, category, publishedAt, imageCount }));

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
        <Suspense fallback={<CasesListView cases={items} categories={WIN_CASE_CATEGORIES} selected={null} />}>
          <CasesList cases={items} categories={WIN_CASE_CATEGORIES} />
        </Suspense>
      </div>
    </>
  );
}
