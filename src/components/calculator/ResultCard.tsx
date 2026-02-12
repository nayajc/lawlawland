import { Card } from '@/components/ui/card';

interface ResultCardProps {
  result: {
    totalIncome: number;
    estimatedMin: number;
    estimatedMax: number;
    perChild: number;
    description: string;
  };
}

export function ResultCard({ result }: ResultCardProps) {
  return (
    <Card className="p-6 bg-gradient-to-br from-indigo-50 to-white border-indigo-100 shadow-sm">
      <h3 className="text-sm font-semibold text-indigo-900 mb-4">예상 양육비</h3>
      <div className="text-center mb-4">
        <p className="text-3xl font-bold text-indigo-600">
          {result.estimatedMin}만원 ~ {result.estimatedMax}만원
        </p>
        <p className="text-xs text-gray-500 mt-1">월 기준</p>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between py-1.5 border-b border-indigo-50">
          <span className="text-gray-600">부모 합산 소득</span>
          <span className="font-medium">{result.totalIncome}만원/월</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-indigo-50">
          <span className="text-gray-600">자녀 1인당 예상</span>
          <span className="font-medium">{result.perChild}만원/월</span>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-4 leading-relaxed">
        {result.description}
        <br />
        * 서울가정법원 양육비 산정기준표를 참고한 예상 금액이며, 실제 양육비는 개별 사정에 따라 달라질 수 있습니다.
      </p>
    </Card>
  );
}
