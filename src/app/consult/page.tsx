import { BookingWidget } from '@/components/consult/BookingWidget';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '상담 신청 - 오수진 변호사',
  description: '오수진 변호사에게 상담을 신청하세요. 원하는 날짜와 시간을 선택해 바로 예약할 수 있습니다.',
  alternates: { canonical: '/consult' },
};

export default function ConsultPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">오수진 변호사 상담 신청</h1>
        <p className="text-base text-gray-600 mt-1 leading-relaxed">
          원하시는 날짜와 시간을 선택해 오수진 변호사와의 상담을 바로 예약하세요.
        </p>
      </div>

      <BookingWidget />
    </div>
  );
}
