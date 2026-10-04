import { NextResponse } from 'next/server';
import { analyzePrecedents } from '@/lib/ai/precedent-search';
import { LawApiError } from '@/lib/law-api';
import { rateLimited } from '@/lib/rate-limit';

export const maxDuration = 60;

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) return NextResponse.json({ error: 'AI 분석이 설정되지 않았습니다.' }, { status: 503 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (rateLimited(`analyze:${ip}`, 5)) return NextResponse.json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.' }, { status: 429 });

  const { question, ids } = (await req.json().catch(() => ({}))) as { question?: string; ids?: unknown };
  const q = (question ?? '').trim();
  const idList = Array.isArray(ids) ? ids.filter((i): i is string => typeof i === 'string' && /^\d+$/.test(i)).slice(0, 3) : [];
  if (q.length < 5 || q.length > 500 || idList.length === 0) return NextResponse.json({ error: '요청이 올바르지 않습니다.' }, { status: 400 });

  try {
    return NextResponse.json({ analyses: await analyzePrecedents(q, idList) });
  } catch (e) {
    console.error('[precedents/ai/analyze]', e);
    return NextResponse.json({ error: e instanceof LawApiError ? e.message : 'AI 분석 중 문제가 발생했습니다.' }, { status: 502 });
  }
}
