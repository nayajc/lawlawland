const situations = [
  {
    num: '01',
    title: '배우자의 외도를 알게 됐어요',
    desc: '증거 확보부터 위자료 청구까지, 절차를 모르면 손해입니다.',
  },
  {
    num: '02',
    title: '재산분할이 걱정돼요',
    desc: '혼인 중 형성된 재산, 기여도를 입증해야 정당한 몫을 받습니다.',
  },
  {
    num: '03',
    title: '아이 양육권을 지키고 싶어요',
    desc: '법원은 아이의 최선 이익을 봅니다. 준비된 쪽이 유리합니다.',
  },
  {
    num: '04',
    title: '배우자가 이혼을 거부해요',
    desc: '상대방이 동의 안 해도 이혼소송으로 이혼이 가능합니다.',
  },
  {
    num: '05',
    title: '양육비를 안 주고 있어요',
    desc: '양육비 이행 명령 · 감치 신청으로 강제집행이 가능합니다.',
  },
  {
    num: '06',
    title: '협의이혼 서류가 복잡해요',
    desc: '작성 실수 하나로 절차가 처음부터 다시 시작될 수 있습니다.',
  },
];

export function SituationCards() {
  return (
    <section style={{ backgroundColor: '#E8F4FD' }} className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--gold)' }}>
            이런 분들이 오십니다
          </p>
          <h2 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--body-text)' }}>
            혼자 고민하지 마세요
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {situations.map((s) => (
            <div
              key={s.title}
              className="bg-white rounded-2xl p-5 border"
              style={{ borderColor: '#D4E4F0' }}
            >
              <div
                className="text-3xl font-bold mb-3 leading-none"
                style={{ color: '#1B2E4B', opacity: 0.18, fontVariantNumeric: 'tabular-nums' }}
              >
                {s.num}
              </div>
              <p className="font-semibold text-sm mb-1.5" style={{ color: '#1B2840' }}>{s.title}</p>
              <p className="text-xs leading-relaxed" style={{ color: '#5C6F8A' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
