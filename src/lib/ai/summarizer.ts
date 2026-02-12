import type { ChatMessage } from '@/types';

export function generateSummaryPrompt(messages: ChatMessage[], category: string): string {
  const conversation = messages
    .map((m) => `${m.role === 'user' ? '사용자' : 'AI'}: ${m.content}`)
    .join('\n');

  return `다음 AI 법률 상담 대화를 변호사에게 전달하기 위해 간결하게 요약해주세요.

## 요약 형식
1. **상담 카테고리**: ${category}
2. **핵심 쟁점**: (사용자의 주요 관심사 2-3가지)
3. **상황 요약**: (사용자의 상황을 3-5문장으로 요약)
4. **AI 안내 내용**: (AI가 제공한 주요 정보 요약)

## 대화 내용
${conversation}

위 형식에 맞춰 한국어로 요약해주세요.`;
}
