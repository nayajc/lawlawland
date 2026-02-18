import { NextResponse } from 'next/server';
import type { ConsultationRequest } from '@/types';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ConsultationRequest;

    if (!body.name || !body.phone || !body.privacyAgreed || !body.summary) {
      return NextResponse.json(
        { success: false, message: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 이메일 발송
    const { sendConsultationEmail } = await import('@/lib/email/resend');
    const lawyerEmail = process.env.LAWYER_EMAIL;
    if (!lawyerEmail) {
      console.error('LAWYER_EMAIL env var is not set');
      return NextResponse.json(
        { success: false, message: '이메일 수신자가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    try {
      await sendConsultationEmail({
        lawyerEmail,
        clientName: body.name,
        clientPhone: body.phone,
        clientEmail: body.email,
        preferredTime: body.preferredTime,
        category: 'general',
        summary: body.summary,
      });
    } catch (emailError) {
      console.error('Email send error:', emailError);
      return NextResponse.json(
        { success: false, message: `이메일 발송 실패: ${emailError instanceof Error ? emailError.message : '알 수 없는 오류'}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      requestId: `email_${Date.now()}`,
      message: '상담 요청이 접수되었습니다.',
    });
  } catch (error) {
    console.error('Consult API error:', error);
    return NextResponse.json(
      { success: false, message: `서버 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}` },
      { status: 500 }
    );
  }
}
