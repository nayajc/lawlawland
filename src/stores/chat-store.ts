import { create } from 'zustand';
import type { ChatMessage, ChatCategory } from '@/types';

interface ChatStore {
  messages: ChatMessage[];
  category: ChatCategory;
  sessionId: string;
  isLoading: boolean;
  conversationId: string | null;

  addMessage: (message: ChatMessage) => void;
  updateLastAssistantMessage: (content: string) => void;
  setCategory: (category: ChatCategory) => void;
  setLoading: (loading: boolean) => void;
  setConversationId: (id: string) => void;
  clearChat: () => void;
  getMessagesForApi: () => { role: 'user' | 'assistant'; content: string }[];
  getSummaryForConsult: () => string;
}

function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  category: 'general',
  sessionId: generateSessionId(),
  isLoading: false,
  conversationId: null,

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  updateLastAssistantMessage: (content) =>
    set((state) => {
      const messages = [...state.messages];
      const lastIdx = messages.length - 1;
      if (lastIdx >= 0 && messages[lastIdx].role === 'assistant') {
        messages[lastIdx] = { ...messages[lastIdx], content };
      }
      return { messages };
    }),

  setCategory: (category) => set({ category }),

  setLoading: (isLoading) => set({ isLoading }),

  setConversationId: (id) => set({ conversationId: id }),

  clearChat: () =>
    set({
      messages: [],
      category: 'general',
      sessionId: generateSessionId(),
      conversationId: null,
    }),

  getMessagesForApi: () =>
    get().messages.map((m) => ({ role: m.role, content: m.content })),

  getSummaryForConsult: () => {
    const msgs = get().messages;
    if (msgs.length === 0) return '(AI 상담 내역 없음)';
    const userMessages = msgs.filter((m) => m.role === 'user').map((m) => m.content);
    const aiMessages = msgs.filter((m) => m.role === 'assistant').map((m) => m.content);
    return `[사용자 질문 요약]\n${userMessages.slice(0, 5).join('\n')}\n\n[AI 안내 요약]\n${aiMessages.slice(0, 3).map((m) => m.substring(0, 200)).join('\n')}`;
  },
}));
