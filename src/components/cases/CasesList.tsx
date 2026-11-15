'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronRight, Images } from 'lucide-react';
import { CaseCategoryBadge } from '@/components/cases/CaseCategoryBadge';
import type { WinCaseCategory } from '@/types';

export type CasesListItem = {
  slug: string;
  title: string;
  category: WinCaseCategory;
  publishedAt: string;
  imageCount: number;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Seoul' });
}

/**
 * 분류 필터를 브라우저에서 처리한다.
 * 서버에서 searchParams를 읽으면 /cases 가 방문마다 다시 렌더링(서버 CPU 사용)되므로,
 * 페이지는 정적으로 한 번만 만들고 ?category= 는 여기서 걸러낸다.
 */
export function CasesList({ cases, categories }: { cases: CasesListItem[]; categories: WinCaseCategory[] }) {
  const param = useSearchParams().get('category');
  const selected = categories.find((c) => c === param) ?? null;
  return <CasesListView cases={cases} categories={categories} selected={selected} />;
}

/** 필터 없는 정적 HTML(검색엔진·첫 화면)에도 같은 목록을 쓰기 위해 분리 */
export function CasesListView({ cases, categories, selected }: { cases: CasesListItem[]; categories: WinCaseCategory[]; selected: WinCaseCategory | null }) {

  const counts = new Map<string, number>();
  for (const c of cases) counts.set(c.category, (counts.get(c.category) ?? 0) + 1);
  const shown = selected ? cases.filter((c) => c.category === selected) : cases;

  return (
    <>
      <nav aria-label="분류" className="flex flex-wrap gap-2 mb-6">
        <FilterChip href="/cases" active={!selected} label={`전체 ${cases.length}`} />
        {categories.filter((cat) => counts.get(cat)).map((cat) => (
          <FilterChip
            key={cat}
            href={`/cases?category=${encodeURIComponent(cat)}`}
            active={selected === cat}
            label={`${cat} ${counts.get(cat)}`}
          />
        ))}
      </nav>

      {shown.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg" style={{ color: '#5C6F8A' }}>등록된 승소사례가 없습니다.</p>
        </div>
      ) : (
        <ol className="space-y-2">
          {shown.map((c) => (
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
