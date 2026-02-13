import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendConsultEmailParams {
  lawyerEmail: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  preferredTime?: string;
  category: string;
  summary: string;
}

function formatConversationHtml(summary: string): string {
  const lines = summary.split('\n');
  let html = '';
  let currentRole = '';
  let currentContent = '';

  const flushMessage = () => {
    if (!currentContent.trim()) return;
    const isUser = currentRole === '사용자';
    const bgColor = isUser ? '#EEF2FF' : '#F9FAFB';
    const borderColor = isUser ? '#C7D2FE' : '#E5E7EB';
    const label = isUser ? '👤 사용자' : '🤖 AI 상담';
    html += `
      <div style="background: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px;">
        <div style="font-size: 12px; font-weight: 600; color: ${isUser ? '#4F46E5' : '#6B7280'}; margin-bottom: 6px;">${label}</div>
        <div style="font-size: 14px; color: #111827; line-height: 1.6; white-space: pre-wrap;">${currentContent.trim()}</div>
      </div>`;
  };

  for (const line of lines) {
    const match = line.match(/^\[(사용자|AI 상담)\]$/);
    if (match) {
      flushMessage();
      currentRole = match[1];
      currentContent = '';
    } else {
      currentContent += line + '\n';
    }
  }
  flushMessage();

  return html || `<div style="white-space: pre-wrap; color: #111827; line-height: 1.6;">${summary}</div>`;
}

export async function sendConsultationEmail(params: SendConsultEmailParams) {
  const { lawyerEmail, clientName, clientPhone, clientEmail, preferredTime, category, summary } = params;

  const categoryLabels: Record<string, string> = {
    general: '일반 상담',
    'divorce-reason': '이혼 사유',
    property: '재산분할',
    alimony: '위자료',
    custody: '양육권',
    'parental-authority': '친권',
    'name-change': '성 변경',
    procedure: '이혼 절차',
  };

  const categoryLabel = categoryLabels[category] || '일반 상담';
  const date = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  const conversationHtml = formatConversationHtml(summary);

  const { data, error } = await resend.emails.send({
    from: '오수진 변호사 AI 상담 <noreply@dalbit.club>',
    to: lawyerEmail,
    subject: `[오수진변호사] 새 상담 요청 - ${clientName}님 (${categoryLabel})`,
    html: `
      <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="border-bottom: 2px solid #4F46E5; padding-bottom: 16px; margin-bottom: 24px;">
          <h1 style="color: #4F46E5; font-size: 20px; margin: 0;">오수진 변호사 상담 요청</h1>
          <p style="color: #6B7280; font-size: 13px; margin: 4px 0 0 0;">${date}</p>
        </div>

        <div style="background: #F9FAFB; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="font-size: 16px; color: #111827; margin: 0 0 12px 0;">신청인 정보</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 4px 0; color: #6B7280; width: 120px;">이름</td><td style="padding: 4px 0; font-weight: 600;">${clientName}</td></tr>
            <tr><td style="padding: 4px 0; color: #6B7280;">연락처</td><td style="padding: 4px 0; font-weight: 600;">${clientPhone}</td></tr>
            <tr><td style="padding: 4px 0; color: #6B7280;">이메일</td><td style="padding: 4px 0;">${clientEmail || '미제공'}</td></tr>
            <tr><td style="padding: 4px 0; color: #6B7280;">선호 연락 시간</td><td style="padding: 4px 0;">${preferredTime || '무관'}</td></tr>
            <tr><td style="padding: 4px 0; color: #6B7280;">상담 카테고리</td><td style="padding: 4px 0;">${categoryLabel}</td></tr>
          </table>
        </div>

        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 16px; color: #111827; margin: 0 0 12px 0;">💬 전체 대화 내역</h2>
          ${conversationHtml}
        </div>

        <div style="border-top: 1px solid #E5E7EB; padding-top: 16px; color: #9CA3AF; font-size: 12px;">
          이 메일은 오수진 변호사 AI 상담 시스템에서 자동 발송되었습니다.
        </div>
      </div>
    `,
  });

  if (error) {
    throw new Error(`이메일 발송 실패: ${error.message}`);
  }

  return data;
}
