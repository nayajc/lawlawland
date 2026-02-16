import { ChildSupportCalc } from '@/components/calculator/ChildSupportCalc';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '양육비 계산기 - 오수진 변호사',
  description: '부모 소득, 자녀 수, 연령을 입력하면 예상 양육비를 산출해드립니다.',
};

export default function CalculatorPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">양육비 계산기</h1>
        <p className="text-sm text-gray-500 mt-1">
          서울가정법원 양육비 산정기준표를 기반으로 예상 양육비를 계산합니다.
        </p>
      </div>
      <ChildSupportCalc />
    </div>
  );
}
