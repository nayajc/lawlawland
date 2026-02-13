'use client';

import Link from 'next/link';
import { Phone } from 'lucide-react';
import { useChatStore } from '@/stores/chat-store';

export function ConsultCTA() {
  const messages = useChatStore((s) => s.messages);

  if (messages.length < 4) return null;

  return (
    <Link
      href="/consult"
      className="inline-flex items-center gap-1.5 bg-indigo-600 text-white rounded-full px-3 py-1.5 text-xs font-medium hover:bg-indigo-700 transition-colors shadow-sm"
    >
      <Phone className="w-3 h-3" />
      변호사 상담
    </Link>
  );
}
