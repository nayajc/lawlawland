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

    // Real mode
    const { sendConsultationEmail } = await import('@/lib/email/resend');

    let requestId: string | null = null;

    // 1. DB 저장 시도 (실패해도 이메일은 발송)
    try {
      const { createServerClient } = await import('@/lib/supabase/server');
      const supabase = createServerClient();

      const { data: request, error: insertError } = await supabase
        .from('consultation_requests')
        .insert({
          conversation_id: body.conversationId || null,
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
      } else {
        requestId = request.id;
      }
    } catch (dbError) {
      console.error('DB connection error:', dbError);
    }

    // 2. 이메일 발송 (DB 성공 여부와 무관하게 시도)
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

      // DB 저장 성공했으면 상태 업데이트
      if (requestId) {
        try {
          const { createServerClient } = await import('@/lib/supabase/server');
          const supabase = createServerClient();
          await supabase
            .from('consultation_requests')
            .update({ status: 'sent', email_sent_at: new Date().toISOString() })
            .eq('id', requestId);
        } catch {
          // 상태 업데이트 실패는 무시
        }
      }
    } catch (emailError) {
      console.error('Email send error:', emailError);
      return NextResponse.json(
        { success: false, message: `이메일 발송 실패: ${emailError instanceof Error ? emailError.message : '알 수 없는 오류'}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      requestId: requestId || `email_${Date.now()}`,
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
