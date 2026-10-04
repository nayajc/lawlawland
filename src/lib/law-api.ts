// 국가법령정보 공동활용 Open API (판례). IP 등록이 필요하므로 LAW_API_BASE_URL 로
// 고정 IP 프록시(jcmain)를 경유할 수 있다. 프록시 사용 시 OC 는 프록시가 주입한다.
const BASE_URL = (process.env.LAW_API_BASE_URL || 'https://www.law.go.kr/DRF').replace(/\/$/, '');

export interface PrecedentSummary {
  id: string;
  caseName: string;
  caseNumber: string;
  court: string;
  caseType: string;
  judgmentType: string;
  date: string;
}

export interface PrecedentSearchResult {
  total: number;
  page: number;
  display: number;
  items: PrecedentSummary[];
}

export interface PrecedentDetail extends PrecedentSummary {
  issue: string;
  summary: string;
  refStatutes: string;
  refCases: string;
  content: string;
}

export class LawApiError extends Error {}

async function callLaw(path: 'lawSearch.do' | 'lawService.do', params: Record<string, string>) {
  const url = new URL(`${BASE_URL}/${path}`);
  const oc = process.env.LAW_API_OC;
  if (oc) url.searchParams.set('OC', oc);
  url.searchParams.set('type', 'JSON');
  url.searchParams.set('target', 'prec');
  for (const [k, v] of Object.entries(params)) if (v) url.searchParams.set(k, v);

  const headers: Record<string, string> = {};
  if (process.env.LAW_PROXY_TOKEN) headers['x-proxy-token'] = process.env.LAW_PROXY_TOKEN;

  const res = await fetch(url, { headers, next: { revalidate: 3600 }, signal: AbortSignal.timeout(15000) });
  const text = await res.text();
  if (!res.ok) throw new LawApiError(`법령 API 오류 (${res.status})`);
  try {
    return JSON.parse(text);
  } catch {
    // IP 미등록·OC 오류 시 HTML/문구로 응답한다.
    throw new LawApiError('법령 API 응답을 해석할 수 없습니다. 인증값(OC)/등록 IP를 확인하세요.');
  }
}

export async function searchPrecedents(opts: {
  query: string;
  search?: '1' | '2';
  page?: number;
  display?: number;
}): Promise<PrecedentSearchResult> {
  const display = opts.display ?? 20;
  const page = opts.page ?? 1;
  const json = await callLaw('lawSearch.do', {
    query: opts.query,
    search: opts.search ?? '2',
    display: String(display),
    page: String(page),
    org: '400201', // 대법원 판례 위주 (국세·행정 하급심 노이즈 제외)
    sort: 'ddes',
  });
  const root = json.PrecSearch;
  if (!root) {
    const msg = typeof json.Law === 'string' ? json.Law : typeof json.msg === 'string' ? json.msg : '';
    throw new LawApiError(msg ? `법령 API: ${msg}` : '검색 결과를 불러오지 못했습니다.');
  }
  const raw = Array.isArray(root.prec) ? root.prec : root.prec ? [root.prec] : [];
  return {
    total: Number(root.totalCnt) || 0,
    page,
    display,
    items: raw.map(toSummary),
  };
}

export async function getPrecedent(id: string): Promise<PrecedentDetail | null> {
  if (!/^\d+$/.test(id)) return null;
  const json = await callLaw('lawService.do', { ID: id });
  const d = json.PrecService;
  if (!d) return null;
  return {
    id,
    caseName: d['사건명'] ?? '',
    caseNumber: d['사건번호'] ?? '',
    court: d['법원명'] ?? '',
    caseType: d['사건종류명'] ?? '',
    judgmentType: d['판결유형'] ?? '',
    date: d['선고일자'] ?? '',
    issue: d['판시사항'] ?? '',
    summary: d['판결요지'] ?? '',
    refStatutes: d['참조조문'] ?? '',
    refCases: d['참조판례'] ?? '',
    content: d['판례내용'] ?? '',
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toSummary(p: any): PrecedentSummary {
  return {
    id: String(p['판례일련번호']),
    caseName: p['사건명'] ?? '',
    caseNumber: p['사건번호'] ?? '',
    court: p['법원명'] ?? '',
    caseType: p['사건종류명'] ?? '',
    judgmentType: p['판결유형'] ?? '',
    date: p['선고일자'] ?? '',
  };
}

/** API 본문의 <br/> 등을 줄바꿈 텍스트로 변환 (HTML 주입 방지를 위해 태그 제거). */
export function toPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
