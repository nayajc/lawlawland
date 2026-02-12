// 양육비 산정기준표 기반 계산 로직
// 서울가정법원 양육비 산정기준표 2024 참조 (단위: 만원/월)
// 부모 합산소득 구간별, 자녀 연령대별 양육비

interface ChildSupportInput {
  fatherIncome: number; // 만원/월
  motherIncome: number; // 만원/월
  childrenCount: number;
  childAge: 'young' | 'elementary' | 'middle' | 'high'; // 0~5, 6~11, 12~14, 15~18
}

interface ChildSupportResult {
  totalIncome: number;
  estimatedMin: number;
  estimatedMax: number;
  perChild: number;
  custodialParentShare: number;
  nonCustodialParentShare: number;
  description: string;
}

// 양육비 산정기준표 (부모 합산소득 구간별, 자녀 1인 기준, 만원/월)
const SUPPORT_TABLE: Record<string, { min: number; max: number }[]> = {
  // [0~199, 200~299, 300~399, 400~499, 500~599, 600~699, 700~799, 800+]
  young: [
    { min: 50, max: 60 },
    { min: 60, max: 80 },
    { min: 80, max: 100 },
    { min: 100, max: 120 },
    { min: 120, max: 150 },
    { min: 150, max: 180 },
    { min: 180, max: 210 },
    { min: 210, max: 260 },
  ],
  elementary: [
    { min: 55, max: 65 },
    { min: 65, max: 90 },
    { min: 90, max: 110 },
    { min: 110, max: 140 },
    { min: 140, max: 170 },
    { min: 170, max: 200 },
    { min: 200, max: 230 },
    { min: 230, max: 290 },
  ],
  middle: [
    { min: 60, max: 70 },
    { min: 70, max: 100 },
    { min: 100, max: 130 },
    { min: 130, max: 160 },
    { min: 160, max: 190 },
    { min: 190, max: 220 },
    { min: 220, max: 260 },
    { min: 260, max: 320 },
  ],
  high: [
    { min: 65, max: 80 },
    { min: 80, max: 110 },
    { min: 110, max: 140 },
    { min: 140, max: 170 },
    { min: 170, max: 210 },
    { min: 210, max: 250 },
    { min: 250, max: 290 },
    { min: 290, max: 360 },
  ],
};

function getIncomeIndex(totalIncome: number): number {
  if (totalIncome < 200) return 0;
  if (totalIncome < 300) return 1;
  if (totalIncome < 400) return 2;
  if (totalIncome < 500) return 3;
  if (totalIncome < 600) return 4;
  if (totalIncome < 700) return 5;
  if (totalIncome < 800) return 6;
  return 7;
}

export function calculateChildSupport(input: ChildSupportInput): ChildSupportResult {
  const { fatherIncome, motherIncome, childrenCount, childAge } = input;
  const totalIncome = fatherIncome + motherIncome;
  const incomeIndex = getIncomeIndex(totalIncome);
  const table = SUPPORT_TABLE[childAge];
  const range = table[incomeIndex];

  // 자녀 수 가산 (2명: x1.8, 3명 이상: x2.5)
  let multiplier = 1;
  if (childrenCount === 2) multiplier = 1.8;
  else if (childrenCount >= 3) multiplier = 2.5;

  const estimatedMin = Math.round(range.min * multiplier);
  const estimatedMax = Math.round(range.max * multiplier);
  const perChild = Math.round((estimatedMin + estimatedMax) / 2 / childrenCount);

  // 비양육자 부담 비율 (소득 비율 기반)
  const nonCustodialRatio = totalIncome > 0 ? Math.max(fatherIncome, motherIncome) / totalIncome : 0.5;
  const avgSupport = (estimatedMin + estimatedMax) / 2;
  const nonCustodialParentShare = Math.round(avgSupport * nonCustodialRatio);
  const custodialParentShare = Math.round(avgSupport - nonCustodialParentShare);

  const ageLabels: Record<string, string> = {
    young: '0~5세',
    elementary: '6~11세 (초등)',
    middle: '12~14세 (중등)',
    high: '15~18세 (고등)',
  };

  return {
    totalIncome,
    estimatedMin,
    estimatedMax,
    perChild,
    custodialParentShare,
    nonCustodialParentShare,
    description: `부모 합산소득 ${totalIncome}만원, 자녀 ${childrenCount}명(${ageLabels[childAge]}) 기준`,
  };
}

export const AGE_OPTIONS = [
  { value: 'young' as const, label: '0~5세 (영유아)' },
  { value: 'elementary' as const, label: '6~11세 (초등학생)' },
  { value: 'middle' as const, label: '12~14세 (중학생)' },
  { value: 'high' as const, label: '15~18세 (고등학생)' },
];
