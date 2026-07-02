import Image from 'next/image';
import Link from 'next/link';

const credentials = [
  '고려대학교 법학 박사과정 수료',
  '대한변호사협회 등록 변호사',
  '변리사 자격 보유',
  'KBS · SBS · 채널A 법률 자문 출연',
  '이혼 · 가사 소송 전담 10년',
];

export function LawyerProfile() {
  return (
    <section style={{ backgroundColor: 'var(--sky-bg)' }} className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <div className="shrink-0">
            <div className="rounded-2xl overflow-hidden shadow-md" style={{ border: '3px solid var(--soft-border)' }}>
              <Image
                src="/ohsoojin1.png"
                alt="오수진 변호사"
                width={400}
                height={500}
                className="w-52 md:w-64 h-auto"
              />
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <p className="text-sm font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--gold)' }}>
              변호사 소개
            </p>
            <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--body-text)' }}>
              오수진 변호사
            </h2>
            <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--muted-fg)' }}>
              이혼은 단순한 법적 절차가 아닙니다. 오수진 변호사는 10년간 수백 건의 가사 사건을 통해
              의뢰인 한 분 한 분의 상황에 맞는 최선의 결과를 이끌어 왔습니다.
            </p>
            <ul className="space-y-2 mb-6">
              {credentials.map((c) => (
                <li key={c} className="flex items-center gap-2 text-sm" style={{ color: 'var(--body-text)' }}>
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--gold)' }} />
                  {c}
                </li>
              ))}
            </ul>
            <Link href="/about">
              <button
                className="text-sm font-semibold px-5 py-2.5 rounded-md border transition-colors"
                style={{ borderColor: 'var(--navy)', color: 'var(--navy)' }}
              >
                자세히 보기 →
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
