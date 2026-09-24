'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { ChatMessage } from '@/types';

const IDLE_MS = 3 * 60 * 1000; // 마지막 메시지 후 3분 무응답이면 전송

/**
 * 채팅 세션이 끝날 때(탭 숨김·페이지 이탈·3분 무응답·컴포넌트 언마운트)
 * 대화 전체를 /api/chat/transcript 로 보낸다.
 * 이미 보낸 이후 새 메시지가 없으면 다시 보내지 않고, 새 메시지가 있으면 "업데이트"로 보낸다.
 */
export function useChatTranscriptReporter(messages: ChatMessage[], category: string, sessionId: string) {
  const sentCountRef = useRef(0);
  const sentOnceRef = useRef(false);
  const latest = useRef({ messages, category, sessionId });
  useEffect(() => {
    latest.current = { messages, category, sessionId };
  }, [messages, category, sessionId]);

  const send = useCallback(() => {
    const { messages, category, sessionId } = latest.current;
    const hasUser = messages.some((m) => m.role === 'user');
    const hasAssistant = messages.some((m) => m.role === 'assistant');
    if (!hasUser || !hasAssistant) return;
    if (messages.length <= sentCountRef.current) return; // 보낸 뒤 새 메시지 없음

    const payload = JSON.stringify({
      sessionId,
      category,
      isUpdate: sentOnceRef.current,
      messages: messages.map((m) => ({ role: m.role, content: m.content, timestamp: m.timestamp })),
    });
    sentCountRef.current = messages.length;
    sentOnceRef.current = true;

    // 페이지 이탈 중에도 전송이 보장되는 sendBeacon 우선
    try {
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        if (navigator.sendBeacon('/api/chat/transcript', new Blob([payload], { type: 'application/json' }))) return;
      }
    } catch {
      /* fetch로 대체 */
    }
    fetch('/api/chat/transcript', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }, []);

  // 탭 숨김 / 페이지 이탈 / 언마운트(라우트 이동)
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') send();
    };
    window.addEventListener('pagehide', send);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pagehide', send);
      document.removeEventListener('visibilitychange', onVisibility);
      send();
    };
  }, [send]);

  // 무응답 타이머: 메시지가 추가될 때마다 리셋
  useEffect(() => {
    if (messages.length === 0) return;
    const t = setTimeout(send, IDLE_MS);
    return () => clearTimeout(t);
  }, [messages.length, send]);
}
