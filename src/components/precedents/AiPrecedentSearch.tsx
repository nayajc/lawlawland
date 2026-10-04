'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Sparkles, Loader2, Copy, Check, CalendarClock } from 'lucide-react';
import type { AiPrecedentResponse, PrecedentAnalysis } from '@/lib/ai/precedent-search';

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
  const [analyses, setAnalyses] = useState<Record<string, PrecedentAnalysis>>({});
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(false);
  const [asked, setAsked] = useState('');
  const [copied, setCopied] = useState(false);

  // 유사도 상위 3건은 판결문 전문을 읽는 심층 분석을 이어서 요청한다 (목록은 먼저 보여줌)
  async function analyze(q: string, ids: string[]) {
    if (ids.length === 0) return;
    setAnalyzing(true);
    try {
      const res = await fetch('/api/precedents/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, ids }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setAnalyses(Object.fromEntries((json.analyses as PrecedentAnalysis[]).map((a) => [a.id, a])));
    } catch {
      setAnalysisError(true);
    } finally {
      setAnalyzing(false);
    }
  }

  // 상담 예약 화면의 '사전 질문' 칸에 붙여넣을 요약. 의뢰인이 직접 복사·제출할 때만 변호사에게 전달된다.
  function consultSummary() {
    if (!data) return '';
    const cases = data.results.slice(0, 3).map((r) => `- ${r.court} ${r.caseNumber} (${r.caseName.slice(0, 40)})`).join('\n');
    return `[AI 판례 검색 상담 요약]\n■ 상황\n${asked}\n\n■ AI 정리\n${data.answer}\n\n■ 관련 판례\n${cases}`;
  }

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(consultSummary());
      setCopied(true);
    } catch {
      document.getElementById('consult-summary')?.focus();
      (document.getElementById('consult-summary') as HTMLTextAreaElement | null)?.select();
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setData(null);
    setAnalyses({});
    setAnalysisError(false);
    setCopied(false);
    setAsked(question);
    try {
      const res = await fetch('/api/precedents/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? '검색에 실패했습니다.');
      setData(json);
      void analyze(question, (json as AiPrecedentResponse).results.slice(0, 3).map((r) => r.id));
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
            {data.results.map((r, idx) => {
              const a = analyses[r.id];
              const top3 = idx < 3;
              return (
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
                {top3 && a && (
                  <dl className="mt-3 rounded-md p-3 text-sm leading-6 space-y-2" style={{ backgroundColor: '#F3F8FC', color: '#2E3B52' }}>
                    <div className="text-xs font-semibold" style={{ color: '#1B2E4B' }}>AI 심층 분석 (유사도 상위 {idx + 1}위)</div>
                    {([['사실관계', a.facts], ['법원의 판단', a.holding], ['내 상황에 대한 시사점', a.implication], ['유의할 점', a.caution]] as const).map(([k, v]) => (
                      <div key={k}><dt className="font-semibold text-xs" style={{ color: '#5C6F8A' }}>{k}</dt><dd>{v}</dd></div>
                    ))}
                  </dl>
                )}
                {top3 && !a && analyzing && (
                  <p className="mt-3 text-xs flex items-center gap-1.5" style={{ color: '#8A97AB' }}><Loader2 size={12} className="animate-spin" /> 판결문 전문을 읽고 분석하는 중…</p>
                )}
                {top3 && !a && !analyzing && analysisError && (
                  <p className="mt-3 text-xs" style={{ color: '#8A97AB' }}>심층 분석을 불러오지 못했습니다. 상세 페이지에서 원문을 확인하세요.</p>
                )}
              </li>
              );
            })}
          </ul>
          {data.results.length > 0 && (
            <section className="mt-6 border rounded-lg bg-white p-4" style={{ borderColor: '#D4E4F0' }}>
              <h2 className="text-sm font-bold" style={{ color: '#1B2840' }}>이 내용으로 변호사와 상담하고 싶으신가요?</h2>
              <p className="text-xs mt-1 leading-5" style={{ color: '#5C6F8A' }}>
                아래 요약을 복사해 상담 예약 화면의 상담 내용 칸에 붙여넣으면 변호사가 사전에 상황을 파악할 수 있습니다.
                복사한 내용은 직접 예약을 제출하실 때에만 전달되며, 수정하거나 지우셔도 됩니다.
              </p>
              <textarea id="consult-summary" readOnly value={consultSummary()} rows={6} className="w-full mt-3 border rounded-md px-3 py-2 text-xs leading-5" style={{ borderColor: '#D4E4F0', color: '#2E3B52' }} />
              <div className="flex flex-col sm:flex-row gap-2 mt-3">
                <button type="button" onClick={copySummary} className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-md border" style={{ borderColor: '#1B2E4B', color: '#1B2E4B' }}>
                  {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? '복사되었습니다' : '상담 내용 복사'}
                </button>
                <Link href="/consult" className="inline-flex items-center justify-center gap-1.5 text-white text-sm font-semibold px-4 py-2.5 rounded-md" style={{ backgroundColor: '#1B2E4B' }}>
                  <CalendarClock size={16} /> 상담 일정 잡기
                </Link>
              </div>
            </section>
          )}
          <p className="text-xs mt-6" style={{ color: '#8A97AB' }}>AI가 판시사항·판결요지를 바탕으로 정리한 참고 정보이며 법률 자문이 아닙니다. 원문을 꼭 확인하세요.</p>
        </div>
      )}
    </div>
  );
}
