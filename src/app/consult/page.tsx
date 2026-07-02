import { BookingWidget } from '@/components/consult/BookingWidget';
import { PageHeader } from '@/components/layout/PageHeader';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '상담 신청 - 오수진 변호사',
  description: '오수진 변호사에게 상담을 신청하세요. 원하는 날짜와 시간을 선택해 바로 예약할 수 있습니다.',
  alternates: { canonical: '/consult' },
};

export default function ConsultPage() {
  return (
    <>
      <PageHeader
        title="오수진 변호사 상담 신청"
        description="원하시는 날짜와 시간을 선택해 오수진 변호사와의 상담을 바로 예약하세요."
      />
      <div className="max-w-2xl mx-auto px-4 pb-12">
        <BookingWidget />
      </div>
    </>
  );
}
