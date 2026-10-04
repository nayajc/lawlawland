import { NextResponse } from 'next/server';
import { aiSearchPrecedents } from '@/lib/ai/precedent-search';
import { LawApiError } from '@/lib/law-api';
import { rateLimited } from '@/lib/rate-limit';

export const maxDuration = 60;

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) return NextResponse.json({ error: 'AI 검색이 설정되지 않았습니다.' }, { status: 503 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (rateLimited(`ai:${ip}`, 5)) return NextResponse.json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.' }, { status: 429 });

  const { question } = (await req.json().catch(() => ({}))) as { question?: string };
  const q = (question ?? '').trim();
  if (q.length < 5 || q.length > 500) return NextResponse.json({ error: '상황을 5~500자로 입력해 주세요.' }, { status: 400 });

  try {
    return NextResponse.json(await aiSearchPrecedents(q));
  } catch (e) {
    console.error('[precedents/ai]', e);
    const msg = e instanceof LawApiError ? e.message : 'AI 검색 중 문제가 발생했습니다.';
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
