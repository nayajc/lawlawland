import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { searchPrecedents, getPrecedent, toPlainText, type PrecedentSummary } from '@/lib/law-api';

const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = google('gemini-2.5-flash');

export interface AiPrecedentResult extends PrecedentSummary {
  relevance: 'high' | 'medium' | 'low';
  reason: string;
  issue: string;
  summary: string;
}

export interface AiPrecedentResponse {
  keywords: string[];
  answer: string;
  results: AiPrecedentResult[];
}

// 법령 API 는 공백 구분 AND 검색이므로 키워드를 짧게(1~3어) 여러 개 만든다.
async function extractKeywords(question: string): Promise<string[]> {
  const { object } = await generateObject({
    model: MODEL,
    schema: z.object({ keywords: z.array(z.string().min(1).max(30)).min(2).max(4) }),
    system:
      '당신은 한국 가사·이혼 판례 검색 전문가입니다. 사용자의 상황 설명을 국가법령정보센터 판례 본문 검색에 쓸 검색어로 바꿉니다. ' +
      '검색어는 공백으로 구분된 1~3개 법률 용어(AND 검색)이며, 너무 많은 단어를 넣으면 결과가 0건이 됩니다. ' +
      '구체적인 것부터 일반적인 것까지 2~4개를 만드세요. 예: "재산분할 기여도", "유책배우자 이혼청구", "양육비 소급".',
    prompt: question,
  });
  return object.keywords.map((k) => k.trim()).filter(Boolean);
}

const score = (p: { item: PrecedentSummary; hits: number }) => p.hits + (p.item.caseType === '가사' ? 1 : 0);

export async function aiSearchPrecedents(question: string): Promise<AiPrecedentResponse> {
  const keywords = await extractKeywords(question);

  // 키워드별 검색 → 여러 키워드에 걸린 판례를 우선, 그다음 최신순
  const batches = await Promise.all(
    keywords.map((q) => searchPrecedents({ query: q, search: '2', display: 10 }).catch(() => null)),
  );
  const pool = new Map<string, { item: PrecedentSummary; hits: number }>();
  for (const b of batches) {
    for (const item of b?.items ?? []) {
      const cur = pool.get(item.id);
      if (cur) cur.hits += 1;
      else pool.set(item.id, { item, hits: 1 });
    }
  }
  const top = [...pool.values()]
    // 가사 사건에 가산점 (이혼 서비스 특성), 그다음 최신순
    .sort((a, b) => score(b) - score(a) || b.item.date.localeCompare(a.item.date))
    .slice(0, 8)
    .map((p) => p.item);
  if (top.length === 0) return { keywords, answer: '관련 판례를 찾지 못했습니다. 상황을 조금 다르게 설명해 주세요.', results: [] };

  const details = (await Promise.all(top.map((t) => getPrecedent(t.id).catch(() => null)))).filter((d) => d !== null);
  const clip = (s: string, n: number) => toPlainText(s).slice(0, n);

  const { object } = await generateObject({
    model: MODEL,
    schema: z.object({
      answer: z.string().describe('질문에 대한 판례 기반 종합 설명 (한국어, 400자 이내)'),
      ranked: z.array(
        z.object({
          id: z.string(),
          relevance: z.enum(['high', 'medium', 'low']),
          reason: z.string().describe('이 판례가 질문과 어떻게 관련되는지 1~2문장'),
        }),
      ),
    }),
    system:
      '당신은 이혼·가사 전문 변호사를 돕는 판례 분석 어시스턴트입니다. 반드시 제공된 판례의 판시사항·판결요지에 적힌 내용만 근거로 삼고, ' +
      '없는 판례나 법리를 만들지 마세요. 관련도는 같은 법리를 언급하는지가 아니라, 질문자의 구체적 사실관계(당사자 지위, 쟁점, 청구 형태)와 얼마나 일치하는지로 판단하세요. ' +
      '같은 법리라도 사안 유형이 다르면(예: 사망 후 상속인 상대 청구) medium 이하로, 질문과 무관하면 low 로 표시하세요. ' +
      'answer 에는 사건번호를 근거로 명시하고, 개별 사안의 결론을 단정하지 말고 일반적 법리 정보로 설명하세요.',
    prompt:
      `질문: ${question}\n\n판례 목록:\n` +
      details
        .map((d) => `[id=${d.id}] ${d.court} ${d.caseNumber} (${d.date}) ${d.caseName}\n판시사항: ${clip(d.issue, 500)}\n판결요지: ${clip(d.summary, 900)}`)
        .join('\n\n'),
  });

  const byId = new Map(details.map((d) => [d.id, d]));
  const order = { high: 0, medium: 1, low: 2 };
  const results = object.ranked
    .filter((r) => byId.has(r.id) && r.relevance !== 'low') // 환각 id·무관 판례 제거
    .sort((a, b) => order[a.relevance] - order[b.relevance])
    .map((r) => {
      const d = byId.get(r.id)!;
      return {
        id: d.id, caseName: d.caseName, caseNumber: d.caseNumber, court: d.court, caseType: d.caseType,
        judgmentType: d.judgmentType, date: d.date, relevance: r.relevance, reason: r.reason,
        issue: clip(d.issue, 300), summary: clip(d.summary, 500),
      };
    });
  return { keywords, answer: object.answer, results };
}

export interface PrecedentAnalysis {
  id: string;
  facts: string;
  holding: string;
  implication: string;
  caution: string;
}

/** 유사도 상위 판례의 전문을 읽고 사실관계·법원 판단·질문자 상황에의 시사점을 정리한다. */
export async function analyzePrecedents(question: string, ids: string[]): Promise<PrecedentAnalysis[]> {
  const details = (await Promise.all(ids.map((id) => getPrecedent(id).catch(() => null)))).filter((d) => d !== null);
  if (details.length === 0) return [];
  const clip = (s: string, n: number) => toPlainText(s).slice(0, n);

  const { object } = await generateObject({
    model: MODEL,
    schema: z.object({
      analyses: z.array(
        z.object({
          id: z.string(),
          facts: z.string().describe('이 판례의 사실관계 요약 (2~3문장)'),
          holding: z.string().describe('법원의 판단과 그 핵심 논리 (2~3문장)'),
          implication: z.string().describe('질문자의 상황에 적용할 때의 시사점 (2~3문장)'),
          caution: z.string().describe('사안이 다를 수 있는 점, 이 판례만으로 단정할 수 없는 점 (1~2문장)'),
        }),
      ),
    }),
    system:
      '당신은 이혼·가사 전문 변호사를 돕는 판례 분석 어시스턴트입니다. 제공된 판례 원문에 적힌 내용만 근거로 분석하고, ' +
      '원문에 없는 사실이나 법리를 만들지 마세요. 질문자의 결론을 단정하거나 승소를 보장하는 표현은 쓰지 말고, ' +
      '일반적인 법리 정보와 시사점으로 설명하세요. 쉬운 한국어로 쓰되 사건번호와 법리 용어는 정확히 쓰세요.',
    prompt:
      `질문자 상황: ${question}\n\n` +
      details
        .map(
          (d) =>
            `[id=${d.id}] ${d.court} ${d.caseNumber} (${d.date}) ${d.caseName}\n판시사항: ${clip(d.issue, 600)}\n판결요지: ${clip(d.summary, 1500)}\n판결문: ${clip(d.content, 5000)}`,
        )
        .join('\n\n---\n\n'),
  });

  const valid = new Set(details.map((d) => d.id));
  return object.analyses.filter((a) => valid.has(a.id));
}
