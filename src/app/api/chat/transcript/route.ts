import { NextResponse } from 'next/server';
import type { ChatTranscriptMessage } from '@/lib/email/resend';

/**
 * AI 채팅 세션 종료(페이지 이탈·무응답) 시 클라이언트가 호출.
 * 대화 전체를 CHAT_TRANSCRIPT_EMAIL 수신자에게 Resend로 발송한다.
 */
export async function POST(req: Request) {
  const to = (process.env.CHAT_TRANSCRIPT_EMAIL ?? '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);
  if (to.length === 0) {
    return NextResponse.json({ ok: false, reason: 'CHAT_TRANSCRIPT_EMAIL not set' }, { status: 204 });
  }

  let body: { sessionId?: string; category?: string; messages?: ChatTranscriptMessage[]; isUpdate?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const messages = (body.messages ?? [])
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(0, 200)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 8000), timestamp: m.timestamp }));

  const hasUser = messages.some((m) => m.role === 'user');
  const hasAssistant = messages.some((m) => m.role === 'assistant');
  if (!hasUser || !hasAssistant) {
    return NextResponse.json({ ok: false, reason: 'not enough messages' }, { status: 200 });
  }

  try {
    const { sendChatTranscriptEmail } = await import('@/lib/email/resend');
    await sendChatTranscriptEmail({
      to,
      sessionId: String(body.sessionId ?? 'unknown').slice(0, 80),
      category: String(body.category ?? 'general'),
      messages,
      isUpdate: !!body.isUpdate,
      userAgent: req.headers.get('user-agent') ?? undefined,
      referer: req.headers.get('referer') ?? undefined,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('chat transcript email error:', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
