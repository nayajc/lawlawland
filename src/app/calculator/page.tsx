import { ChildSupportCalc } from '@/components/calculator/ChildSupportCalc';
import { PageHeader } from '@/components/layout/PageHeader';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '양육비 계산기 - 오수진 변호사',
  description: '부모 소득, 자녀 수, 연령을 입력하면 예상 양육비를 산출해드립니다.',
  alternates: { canonical: '/calculator' },
};

export default function CalculatorPage() {
  return (
    <>
      <PageHeader
        title="양육비 계산기"
        description="서울가정법원 양육비 산정기준표를 기반으로 예상 양육비를 계산합니다."
      />
      <div className="max-w-lg mx-auto px-4 pb-12">
        <ChildSupportCalc />
      </div>
    </>
  );
}
