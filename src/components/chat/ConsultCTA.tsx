'use client';

import Link from 'next/link';
import { Phone } from 'lucide-react';
import { useChatStore } from '@/stores/chat-store';

export function ConsultCTA() {
  const messages = useChatStore((s) => s.messages);

  // 메시지가 4개 이상일 때만 표시 (충분한 상담 후)
  if (messages.length < 4) return null;

  return (
    <div className="px-4 pb-2">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/consult"
          className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl py-2.5 text-sm font-medium hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-sm"
        >
          <Phone className="w-4 h-4" />
          전문 변호사에게 상담 요청하기
        </Link>
      </div>
    </div>
  );
}
