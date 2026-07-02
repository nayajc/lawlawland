import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { DISCLAIMER_TEXT } from '@/lib/constants';
import { PageHeader } from '@/components/layout/PageHeader';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '이혼 가이드 - 오수진 변호사',
  description: '이혼 절차, 종류, 준비사항을 한눈에 알아보세요.',
  alternates: { canonical: '/guide' },
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
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guides.map((guide) => ({
      '@type': 'Question',
      name: guide.title,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `${guide.description} ${guide.items.join(' ')}`,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <PageHeader
        title="이혼 가이드"
        description="이혼 관련 기본적인 법률 정보를 한눈에 확인하세요. 항목을 눌러 자세한 내용을 펼쳐보세요."
      />
      <div className="max-w-3xl mx-auto px-4 pb-12">
        <div className="space-y-3">
          {guides.map((guide, idx) => (
            <details
              key={idx}
              open={idx === 0}
              className="group rounded-xl bg-white open:shadow-sm"
              style={{ border: '1px solid #D4E4F0' }}
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 p-5 list-none [&::-webkit-details-marker]:hidden">
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: '#1B2840' }}>{guide.title}</h2>
                  <p className="text-sm mt-0.5" style={{ color: '#5C6F8A' }}>{guide.description}</p>
                </div>
                <ChevronDown className="w-5 h-5 shrink-0 transition-transform group-open:rotate-180" style={{ color: '#5C6F8A' }} />
              </summary>
              <ul className="space-y-2.5 px-5 pb-5 pt-3" style={{ borderTop: '1px solid #D4E4F0' }}>
                {guide.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[15px] leading-relaxed" style={{ color: '#1B2840' }}>
                    <span className="mt-1.5 text-xs" style={{ color: '#A07840' }}>&#9679;</span>
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
            className="inline-flex items-center gap-2 font-medium text-sm"
            style={{ color: '#1B2E4B' }}
          >
            더 자세한 내용은 AI 상담에서 질문해보세요
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <p className="text-xs mt-8 text-center leading-relaxed" style={{ color: '#5C6F8A' }}>{DISCLAIMER_TEXT}</p>
      </div>
    </>
  );
}
