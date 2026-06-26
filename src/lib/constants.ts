import type { ChatCategory } from '@/types';

export const CATEGORIES: { id: ChatCategory; label: string; icon: string; description: string }[] = [
  { id: 'general', label: '일반 상담', icon: 'MessageCircle', description: '이혼 관련 전반적인 질문' },
  { id: 'divorce-reason', label: '이혼 사유', icon: 'FileText', description: '성격차이, 외도, 가정폭력 등' },
  { id: 'property', label: '재산분할', icon: 'Building', description: '재산분할 비율, 특유재산 등' },
  { id: 'alimony', label: '위자료', icon: 'Wallet', description: '위자료 산정 기준, 청구 방법' },
  { id: 'custody', label: '양육권', icon: 'Heart', description: '양육권, 면접교섭권, 양육비' },
  { id: 'parental-authority', label: '친권', icon: 'Shield', description: '친권자 지정, 변경 절차' },
  { id: 'name-change', label: '성 변경', icon: 'UserCog', description: '이혼 후 자녀 성 변경' },
  { id: 'procedure', label: '이혼 절차', icon: 'ClipboardList', description: '협의이혼, 재판이혼 절차' },
];

export const DISCLAIMER_TEXT = '본 정보는 일반적인 법률 정보이며, 개별 사안에 대한 법률 조언이 아닙니다. 구체적인 사안은 전문 변호사 상담을 권해드립니다.';

// 신뢰 지표 — TODO: 실제 수치로 교체하세요. 허위·과장 광고는 변호사 광고규정 위반이 될 수 있으니
// 검증 가능한 값만 사용하세요.
export const STATS: { value: string; label: string }[] = [
  { value: '15년+', label: '법률 실무 경력' },
  { value: '1,000+', label: '누적 상담' },
  { value: '채널A·KBS·SBS', label: '방송 법률자문 출연' },
];

// AI 상담 진입 시 제안할 예시 질문 (빈 화면 진입장벽 완화)
export const EXAMPLE_QUESTIONS: string[] = [
  '위자료는 보통 얼마나 받을 수 있나요?',
  '양육권은 누구에게 더 유리한가요?',
  '재산분할 비율은 어떻게 정해지나요?',
  '협의이혼 절차와 기간이 궁금해요',
];

export const EMERGENCY_CONTACTS = {
  police: '112',
  womenHotline: '1366',
  suicidePrevention: '1393',
};
