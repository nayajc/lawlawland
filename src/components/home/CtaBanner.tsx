import Link from 'next/link';

export function CtaBanner() {
  return (
    <section className="py-16 px-4" style={{ backgroundColor: '#1B2E4B' }}>
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
          지금 바로 상담을 신청하세요
        </h2>
        <p className="text-white/60 text-sm mb-8 leading-relaxed">
          상담 내용은 철저히 비밀이 보장됩니다.<br />
          오수진 변호사가 직접 사건을 검토하고 연락드립니다.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/consult">
            <button
              className="w-full sm:w-auto text-white font-semibold px-8 py-3.5 rounded-lg text-base"
              style={{ backgroundColor: 'var(--gold)' }}
            >
              상담 신청하기
            </button>
          </Link>
          <Link href="/chat">
            <button
              className="w-full sm:w-auto font-semibold px-8 py-3.5 rounded-lg text-base border border-white/30 text-white/80"
            >
              AI 법률 상담 먼저 해보기
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
