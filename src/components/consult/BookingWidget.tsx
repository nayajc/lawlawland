import { CalendarClock } from 'lucide-react';

const BOOKING_URL =
  'https://jcalendar-pearl.vercel.app/widget/IaKzS7bwF8b6ZAGSlVhxHwuGzGz2';

export function BookingWidget() {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <CalendarClock className="w-5 h-5 text-gray-700" />
        <h2 className="text-lg font-semibold text-gray-900">상담 시간 예약</h2>
      </div>
      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
        원하시는 날짜와 시간을 선택하여 예약해주세요. 긴급 선일정이 있을 경우 사무실에서
        연락드려서 일정을 조율할 수도 있습니다. 감사합니다. (사무실 연락처:{' '}
        <a href="tel:02-6953-6325" className="font-medium text-gray-900 underline underline-offset-2">
          02-6953-6325
        </a>
        )
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
