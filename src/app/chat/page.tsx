import { ChatContainer } from '@/components/chat/ChatContainer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI 상담 - LawLawLand',
  description: '이혼 관련 법률 정보를 AI 챗봇과 대화하며 알아보세요.',
};

export default function ChatPage() {
  return <ChatContainer />;
}
