import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { DISCLAIMER_TEXT } from '@/lib/constants';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '이혼 가이드 - 오수진 변호사',
  description: '이혼 절차, 종류, 준비사항을 한눈에 알아보세요.',
};

const guides = [
  {
    title: '협의이혼 vs 재판이혼',
    description: '이혼의 두 가지 방법과 각각의 절차, 장단점을 알아보세요.',
    items: [
      '협의이혼: 부부가 합의하여 가정법원에서 이혼의사를 확인받는 방식',
      '재판이혼: 법정 이혼 사유가 있을 때 소송을 통해 이혼하는 방식',
      '숙려기간: 미성년 자녀가 있으면 3개월, 없으면 1개월',
    ],
  },
  {
    title: '재산분할',
    description: '혼인 중 형성한 재산을 나누는 기준과 방법을 안내합니다.',
    items: [
      '공동재산: 혼인 중 부부가 함께 형성한 재산',
      '특유재산: 혼인 전 재산, 상속/증여받은 재산',
      '기여도: 재산 형성에 기여한 정도에 따라 분할 비율 결정',
      '청구 시한: 이혼한 날부터 2년 이내',
    ],
  },
  {
    title: '양육권과 양육비',
    description: '자녀의 양육에 관한 권리와 비용에 대해 알아보세요.',
    items: [
      '양육권: 자녀를 직접 양육할 권리 (자녀의 복리를 최우선 고려)',
      '면접교섭권: 비양육 부모가 자녀를 만날 권리',
      '양육비: 서울가정법원 양육비 산정기준표를 참고하여 결정',
    ],
  },
  {
    title: '위자료',
    description: '이혼으로 인한 정신적 손해배상인 위자료에 대해 안내합니다.',
    items: [
      '위자료는 이혼의 책임이 있는 배우자에게 청구 가능',
      '산정 기준: 혼인기간, 과실 정도, 재산 상태 등 종합 고려',
      '재산분할과 별개로 청구 가능',
    ],
  },
];

export default function GuidePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">이혼 가이드</h1>
        <p className="text-base text-gray-600 mt-1 leading-relaxed">
          이혼 관련 기본적인 법률 정보를 한눈에 확인하세요. 항목을 눌러 자세한 내용을 펼쳐보세요.
        </p>
      </div>

      <div className="space-y-3">
        {guides.map((guide, idx) => (
          <details
            key={idx}
            open={idx === 0}
            className="group rounded-xl border border-gray-200 bg-white open:shadow-sm"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 p-5 list-none [&::-webkit-details-marker]:hidden">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{guide.title}</h2>
                <p className="text-sm text-gray-600 mt-0.5">{guide.description}</p>
              </div>
              <ChevronDown className="w-5 h-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
            </summary>
            <ul className="space-y-2.5 px-5 pb-5 pt-1 border-t border-gray-100">
              {guide.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[15px] text-gray-700 leading-relaxed">
                  <span className="text-gray-400 mt-1.5 text-xs">&#9679;</span>
                  {item}
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/chat"
          className="inline-flex items-center gap-2 text-gray-900 font-medium text-sm hover:text-gray-600"
        >
          더 자세한 내용은 AI 상담에서 질문해보세요
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <p className="text-xs text-gray-400 mt-8 text-center leading-relaxed">{DISCLAIMER_TEXT}</p>
    </div>
  );
}
