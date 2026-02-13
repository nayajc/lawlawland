import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '주요 승소사례 - 오수진 변호사',
  description: '이혼전문변호사 오수진의 주요 승소 판결 사례 234건. 가사, 민사, 행정 등 다양한 분야의 승소 기록.',
};

export default function CasesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
