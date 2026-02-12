import { ContactForm } from '@/components/consult/ContactForm';
import { ChatSummary } from '@/components/consult/ChatSummary';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '변호사 상담 요청 - LawLawLand',
  description: '전문 변호사에게 이혼 상담을 요청하세요. AI 상담 내용을 요약하여 전달합니다.',
};

export default function ConsultPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">변호사 상담 요청</h1>
        <p className="text-sm text-gray-500 mt-1">
          연락처를 남겨주시면 AI 상담 내용을 요약하여 전문 변호사에게 전달해드립니다.
        </p>
      </div>
      <div className="space-y-6">
        <ChatSummary />
        <ContactForm />
      </div>
    </div>
  );
}
