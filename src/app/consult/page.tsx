import { ContactForm } from '@/components/consult/ContactForm';
import { ChatSummary } from '@/components/consult/ChatSummary';
import { BookingWidget } from '@/components/consult/BookingWidget';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '상담 신청 - 오수진 변호사',
  description: '오수진 변호사에게 이혼 상담을 신청하세요. 원하는 시간에 바로 예약하거나, AI 상담 내용과 함께 연락처를 남길 수 있습니다.',
};

export default function ConsultPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">오수진 변호사 상담 신청</h1>
        <p className="text-base text-gray-600 mt-1 leading-relaxed">
          원하시는 시간에 직접 예약하시거나, 연락처를 남겨주시면 AI 상담 대화 내용과 함께
          오수진 변호사에게 전달해드립니다.
        </p>
      </div>

      <BookingWidget />

      <div className="my-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-gray-400">또는 연락처 남기기</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <div className="space-y-6">
        <ChatSummary />
        <ContactForm />
      </div>
    </div>
  );
}
