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
        원하시는 날짜와 시간을 선택해 바로 예약하세요. 예약 내용은 오수진 변호사의 일정에
        자동으로 등록됩니다.
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
