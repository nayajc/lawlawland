const steps = [
  {
    step: '01',
    title: '상담 신청',
    desc: '온라인 양식 또는 카카오톡으로 간단히 상황을 남겨주세요. 24시간 이내에 연락드립니다.',
  },
  {
    step: '02',
    title: '오수진 변호사 직접 상담',
    desc: '상황을 충분히 듣고 최선의 방향을 안내드립니다.',
  },
  {
    step: '03',
    title: '맞춤 전략 수립',
    desc: '협의이혼·소송이혼·조정 중 가장 유리한 방법을 선택해 구체적인 계획을 세웁니다.',
  },
  {
    step: '04',
    title: '사건 진행 및 마무리',
    desc: '모든 서류 작성과 법원 대응을 대리합니다. 진행 상황은 실시간으로 공유됩니다.',
  },
];

export function ProcessSteps() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--gold)' }}>
            상담 프로세스
          </p>
          <h2 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--body-text)' }}>
            처음부터 끝까지 함께합니다
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={s.step} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-5 left-[calc(100%-0px)] w-full h-px" style={{ backgroundColor: 'var(--soft-border)' }} />
              )}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white mb-4"
                style={{ backgroundColor: '#1B2E4B' }}
              >
                {s.step}
              </div>
              <p className="font-bold text-sm mb-1.5" style={{ color: 'var(--body-text)' }}>{s.title}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-fg)' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
