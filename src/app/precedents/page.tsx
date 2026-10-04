import Link from 'next/link';
import type { Metadata } from 'next';
import { Search } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { AiPrecedentSearch } from '@/components/precedents/AiPrecedentSearch';
import { searchPrecedents, LawApiError, type PrecedentSearchResult } from '@/lib/law-api';

export const metadata: Metadata = {
  title: '판례 검색 - 오수진 변호사',
  description: '국가법령정보센터 공개 데이터 기반 대법원 판례 검색. 이혼·재산분할·양육권 등 키워드로 판례를 찾아보세요.',
  alternates: { canonical: '/precedents' },
};

interface Props {
  searchParams: Promise<{ q?: string; search?: string; page?: string; mode?: string }>;
}

const PAGE_SIZE = 20;

export default async function PrecedentsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const ai = sp.mode !== 'keyword';
  const q = (sp.q ?? '').trim().slice(0, 100);
  const search = sp.search === '1' ? '1' : '2';
  const page = Math.max(1, Number(sp.page) || 1);

  let result: PrecedentSearchResult | null = null;
  let error: string | null = null;
  if (q && !ai) {
    try {
      result = await searchPrecedents({ query: q, search, page, display: PAGE_SIZE });
    } catch (e) {
      error = e instanceof LawApiError ? e.message : '판례를 불러오는 중 문제가 발생했습니다.';
    }
  }
  const totalPages = result ? Math.ceil(result.total / PAGE_SIZE) : 0;
  const href = (p: number) => `/precedents?q=${encodeURIComponent(q)}&search=${search}&page=${p}&mode=keyword`;

  return (
    <>
      <PageHeader title="판례 검색" badge="Case Law" description="국가법령정보센터 공개 데이터 기반 대법원 판례 검색입니다. 참고용이며 법률 자문이 아닙니다." />
      <div className="max-w-3xl mx-auto px-4 pb-16">
        <div className="flex gap-1 mb-4 text-sm">
          {[{ m: 'ai', l: 'AI 검색' }, { m: 'keyword', l: '키워드 검색' }].map((t) => (
            <Link key={t.m} href={`/precedents?mode=${t.m}`} className="px-4 py-2 rounded-md font-semibold" style={t.m === (ai ? 'ai' : 'keyword') ? { backgroundColor: '#1B2E4B', color: '#fff' } : { backgroundColor: '#EEF3F8', color: '#5C6F8A' }}>
              {t.l}
            </Link>
          ))}
        </div>

        {ai ? <AiPrecedentSearch /> : (<>
        <form action="/precedents" className="flex flex-col sm:flex-row gap-2 mb-3">
          <input type="hidden" name="mode" value="keyword" />
          <input
            name="q"
            defaultValue={q}
            placeholder="예) 이혼 재산분할, 양육비, 유책배우자"
            className="flex-1 border rounded-md px-3 py-2.5 text-sm"
            style={{ borderColor: '#D4E4F0' }}
          />
          <select name="search" defaultValue={search} className="border rounded-md px-3 py-2.5 text-sm" style={{ borderColor: '#D4E4F0' }}>
            <option value="2">본문 검색</option>
            <option value="1">사건명 검색</option>
          </select>
          <button className="inline-flex items-center justify-center gap-1.5 text-white text-sm font-semibold px-5 py-2.5 rounded-md" style={{ backgroundColor: '#1B2E4B' }}>
            <Search size={16} /> 검색
          </button>
        </form>

        {!q && <p className="text-sm py-10 text-center" style={{ color: '#5C6F8A' }}>검색어를 입력해 판례를 찾아보세요.</p>}
        {error && <p className="text-sm py-6 text-red-600">{error}</p>}

        {result && (
          <>
            <p className="text-sm mb-3" style={{ color: '#5C6F8A' }}>총 {result.total.toLocaleString()}건</p>
            <ul className="divide-y border rounded-lg bg-white" style={{ borderColor: '#D4E4F0' }}>
              {result.items.map((p) => (
                <li key={p.id}>
                  <Link href={`/precedents/${p.id}`} className="block px-4 py-3 hover:bg-slate-50">
                    <div className="font-semibold text-sm" style={{ color: '#1B2840' }}>{p.caseName || '(사건명 없음)'}</div>
                    <div className="text-xs mt-1" style={{ color: '#5C6F8A' }}>
                      {p.court} · {p.caseNumber} · {p.date} · {p.caseType}{p.judgmentType ? ` · ${p.judgmentType}` : ''}
                    </div>
                  </Link>
                </li>
              ))}
              {result.items.length === 0 && <li className="px-4 py-8 text-center text-sm" style={{ color: '#5C6F8A' }}>검색 결과가 없습니다.</li>}
            </ul>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-6 text-sm">
                {page > 1 && <Link href={href(page - 1)}>← 이전</Link>}
                <span style={{ color: '#5C6F8A' }}>{page} / {totalPages}</span>
                {page < totalPages && <Link href={href(page + 1)}>다음 →</Link>}
              </div>
            )}
          </>
        )}
        </>)}
      </div>
    </>
  );
}
