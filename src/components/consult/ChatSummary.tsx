'use client';

import { Card } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';
import { useChatStore } from '@/stores/chat-store';

export function ChatSummary() {
  const messages = useChatStore((s) => s.messages);
  const getSummaryForConsult = useChatStore((s) => s.getSummaryForConsult);

  if (messages.length === 0) {
    return (
      <Card className="p-4 bg-gray-50 border-gray-200">
        <p className="text-sm text-gray-500 text-center">
          AI 상담 내역이 없습니다. 먼저 AI 상담을 이용해주세요.
        </p>
      </Card>
    );
  }

  const summary = getSummaryForConsult();

  return (
    <Card className="p-4 bg-indigo-50/50 border-indigo-100">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="w-4 h-4 text-indigo-500" />
        <h3 className="text-sm font-semibold text-gray-800">AI 상담 요약 미리보기</h3>
      </div>
      <p className="text-xs text-gray-500 mb-2">
        아래 내용이 변호사에게 전달됩니다.
      </p>
      <div className="bg-white rounded-lg p-3 border border-indigo-100 max-h-48 overflow-y-auto">
        <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
          {summary}
        </pre>
      </div>
    </Card>
  );
}
