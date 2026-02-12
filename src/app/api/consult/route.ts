import { NextResponse } from 'next/server';
import type { ConsultationRequest } from '@/types';

const isMockMode = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ConsultationRequest;

    if (!body.name || !body.phone || !body.privacyAgreed || !body.summary) {
      return NextResponse.json(
        { success: false, message: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    if (isMockMode) {
      // Mock mode: simulate success without DB/email
      console.log('[MOCK] Consultation request received:', {
        name: body.name,
        phone: body.phone,
        email: body.email,
        preferredTime: body.preferredTime,
        summaryLength: body.summary.length,
      });

      return NextResponse.json({
        success: true,
        requestId: `mock_${Date.now()}`,
        message: '[테스트 모드] 상담 요청이 접수되었습니다.',
      });
    }

    // Real mode with Supabase + Resend
    const { createServerClient } = await import('@/lib/supabase/server');
    const { sendConsultationEmail } = await import('@/lib/email/resend');

    const supabase = createServerClient();

    // 1. consultation_requests 저장
    const { data: request, error: insertError } = await supabase
      .from('consultation_requests')
      .insert({
        conversation_id: body.conversationId,
        name: body.name,
        phone: body.phone,
        email: body.email || null,
        preferred_time: body.preferredTime || null,
        privacy_agreed: body.privacyAgreed,
        summary: body.summary,
        status: 'pending',
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('DB insert error:', insertError);
      return NextResponse.json(
        { success: false, message: '요청 저장에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 2. 변호사 이메일 발송
    const lawyerEmail = process.env.LAWYER_EMAIL;
    if (lawyerEmail) {
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

        // 3. 상태 업데이트
        await supabase
          .from('consultation_requests')
          .update({ status: 'sent', email_sent_at: new Date().toISOString() })
          .eq('id', request.id);
      } catch (emailError) {
        console.error('Email send error:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      requestId: request.id,
      message: '상담 요청이 접수되었습니다.',
    });
  } catch (error) {
    console.error('Consult API error:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
