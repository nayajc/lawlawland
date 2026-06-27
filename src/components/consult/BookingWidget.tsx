import { CalendarClock } from 'lucide-react';

const BOOKING_URL =
  'https://jcalendar-pearl.vercel.app/widget/KbdQVqrQzDf2VnwirTJQuJ1t0zg2';

export function BookingWidget() {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <CalendarClock className="w-5 h-5 text-gray-700" />
        <h2 className="text-lg font-semibold text-gray-900">상담 시간 예약</h2>
      </div>
      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
        원하시는 날짜와 시간을 선택해 예약하세요. 예약 신청 후 오수진 변호사의 일정 확인을
        거쳐 최종 확정되며, 확정 결과는 이메일로 안내해드립니다.
      </p>
      <iframe
        src={BOOKING_URL}
        width="100%"
        height={700}
        frameBorder={0}
        title="오수진 변호사 상담 예약"
        className="rounded-lg border border-gray-200 w-full"
      />
    </section>
  );
}
