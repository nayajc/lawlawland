'use client';

import { useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { useChatStore } from '@/stores/chat-store';
import { CategorySelector } from './CategorySelector';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ChatInput } from './ChatInput';
import { ConsultCTA } from './ConsultCTA';
import { DisclaimerBanner } from './DisclaimerBanner';
import { MessageCircle } from 'lucide-react';
import type { ChatMessage } from '@/types';

export function ChatContainer() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const category = useChatStore((s) => s.category);
  const setCategory = useChatStore((s) => s.setCategory);
  const sessionId = useChatStore((s) => s.sessionId);
  const storeMessages = useChatStore((s) => s.messages);
  const addMessage = useChatStore((s) => s.addMessage);

  const { messages, isLoading, append } = useChat({
    api: '/api/chat',
    body: { category, sessionId },
  });

  // Sync assistant messages to store after streaming completes
  useEffect(() => {
    if (isLoading) return;
    for (const msg of messages) {
      if (msg.role !== 'assistant' || !msg.content) continue;
      if (!storeMessages.find((m) => m.id === msg.id)) {
        addMessage({
          id: msg.id,
          role: 'assistant',
          content: msg.content,
          category,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }, [isLoading, messages, storeMessages, addMessage, category]);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = (content: string) => {
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    addMessage(userMsg);
    append({ role: 'user', content });
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem)] md:h-[calc(100dvh-8rem)]">
      <DisclaimerBanner />
      <CategorySelector selected={category} onSelect={setCategory} />

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-indigo-400" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">
                안녕하세요, 오수진 변호사 AI 상담입니다
              </h2>
              <p className="text-sm md:text-base text-gray-500 max-w-sm leading-relaxed">
                이혼 관련 법률 정보가 궁금하시면 편하게 질문해주세요.
                <br />
                위 카테고리를 선택하면 더 정확한 안내를 받으실 수 있습니다.
              </p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <MessageBubble
              key={msg.id}
              message={{
                id: msg.id,
                role: msg.role as 'user' | 'assistant',
                content: msg.content,
                timestamp: new Date().toISOString(),
              }}
              isLatest={idx === messages.length - 1}
            />
          ))}
          {isLoading && messages[messages.length - 1]?.role === 'user' && <TypingIndicator />}
        </div>
      </div>

      <ChatInput onSend={handleSend} isLoading={isLoading} consultCTA={<ConsultCTA />} />
    </div>
  );
}
