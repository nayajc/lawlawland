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

  const { data, error } = await resend.emails.send({
    from: 'LawLawLand <onboarding@resend.dev>',
    to: lawyerEmail,
    subject: `[LawLawLand] 새 상담 요청 - ${categoryLabel}`,
    html: `
      <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="border-bottom: 2px solid #4F46E5; padding-bottom: 16px; margin-bottom: 24px;">
          <h1 style="color: #4F46E5; font-size: 20px; margin: 0;">LawLawLand 상담 요청</h1>
        </div>

        <div style="background: #F9FAFB; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="font-size: 16px; color: #111827; margin: 0 0 12px 0;">신청인 정보</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 4px 0; color: #6B7280;">이름</td><td style="padding: 4px 0; font-weight: 600;">${clientName}</td></tr>
            <tr><td style="padding: 4px 0; color: #6B7280;">연락처</td><td style="padding: 4px 0; font-weight: 600;">${clientPhone}</td></tr>
            <tr><td style="padding: 4px 0; color: #6B7280;">이메일</td><td style="padding: 4px 0;">${clientEmail || '미제공'}</td></tr>
            <tr><td style="padding: 4px 0; color: #6B7280;">선호 연락 시간</td><td style="padding: 4px 0;">${preferredTime || '무관'}</td></tr>
          </table>
        </div>

        <div style="background: #F9FAFB; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="font-size: 16px; color: #111827; margin: 0 0 12px 0;">AI 상담 요약</h2>
          <p style="color: #6B7280; margin: 0 0 8px 0;">카테고리: ${categoryLabel} | 상담 일시: ${date}</p>
          <div style="white-space: pre-wrap; color: #111827; line-height: 1.6;">${summary}</div>
        </div>

        <div style="border-top: 1px solid #E5E7EB; padding-top: 16px; color: #9CA3AF; font-size: 12px;">
          이 메일은 LawLawLand에서 자동 발송되었습니다.
        </div>
      </div>
    `,
  });

  if (error) {
    throw new Error(`이메일 발송 실패: ${error.message}`);
  }

  return data;
}
