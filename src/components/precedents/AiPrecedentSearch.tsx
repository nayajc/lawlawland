'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import type { AiPrecedentResponse } from '@/lib/ai/precedent-search';

const BADGE = {
  high: { label: '관련도 높음', bg: '#E6F4EA', fg: '#1E6B35' },
  medium: { label: '관련도 보통', bg: '#FFF4D6', fg: '#8A6100' },
  low: { label: '관련도 낮음', bg: '#EEF1F5', fg: '#5C6F8A' },
} as const;

export function AiPrecedentSearch() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AiPrecedentResponse | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch('/api/precedents/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? '검색에 실패했습니다.');
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : '검색에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={submit} className="mb-6">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={4}
          maxLength={500}
          placeholder="상황을 자연어로 적어주세요. 예) 결혼 15년차이고 전업주부로 지냈습니다. 이혼하면 남편 명의 아파트에 대해 재산분할을 받을 수 있나요?"
          className="w-full border rounded-md px-3 py-2.5 text-sm leading-6"
          style={{ borderColor: '#D4E4F0' }}
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs" style={{ color: '#8A97AB' }}>개인정보(실명·주민번호 등)는 입력하지 마세요.</span>
          <button disabled={loading || question.trim().length < 5} className="inline-flex items-center gap-1.5 text-white text-sm font-semibold px-5 py-2.5 rounded-md disabled:opacity-50" style={{ backgroundColor: '#1B2E4B' }}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} AI로 판례 찾기
          </button>
        </div>
      </form>

      {loading && <p className="text-sm py-6 text-center" style={{ color: '#5C6F8A' }}>검색어를 뽑고 판례를 분석하는 중입니다… (10~30초)</p>}
      {error && <p className="text-sm py-4 text-red-600">{error}</p>}

      {data && (
        <div>
          <div className="rounded-lg p-4 mb-5 text-sm leading-7 whitespace-pre-wrap" style={{ backgroundColor: '#F3F8FC', color: '#2E3B52' }}>
            {data.answer}
            <div className="text-xs mt-3" style={{ color: '#8A97AB' }}>사용한 검색어: {data.keywords.join(' · ')}</div>
          </div>
          <ul className="space-y-3">
            {data.results.map((r) => (
              <li key={r.id} className="border rounded-lg bg-white p-4" style={{ borderColor: '#D4E4F0' }}>
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/precedents/${r.id}`} className="font-semibold text-sm hover:underline" style={{ color: '#1B2840' }}>
                    {r.caseName} <span className="font-normal" style={{ color: '#5C6F8A' }}>· {r.court} {r.caseNumber}</span>
                  </Link>
                  <span className="shrink-0 text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: BADGE[r.relevance].bg, color: BADGE[r.relevance].fg }}>
                    {BADGE[r.relevance].label}
                  </span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: '#8A97AB' }}>선고 {r.date}</p>
                <p className="text-sm mt-2 leading-6" style={{ color: '#2E3B52' }}>{r.reason}</p>
                {r.summary && <p className="text-xs mt-2 leading-5 line-clamp-3" style={{ color: '#5C6F8A' }}>판결요지: {r.summary}</p>}
              </li>
            ))}
          </ul>
          <p className="text-xs mt-6" style={{ color: '#8A97AB' }}>AI가 판시사항·판결요지를 바탕으로 정리한 참고 정보이며 법률 자문이 아닙니다. 원문을 꼭 확인하세요.</p>
        </div>
      )}
    </div>
  );
}
