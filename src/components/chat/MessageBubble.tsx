import { cn } from '@/lib/utils';
import { Scale, User } from 'lucide-react';
import type { ChatMessage } from '@/types';

interface MessageBubbleProps {
  message: ChatMessage;
  isLatest?: boolean;
}

export function MessageBubble({ message, isLatest }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-2.5 max-w-[85%]', isUser ? 'ml-auto flex-row-reverse' : '')}>
      <div
        className={cn(
          'w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5',
          isUser ? 'bg-indigo-600' : 'bg-gray-200'
        )}
      >
        {isUser ? (
          <User className="w-3.5 h-3.5 text-white" />
        ) : (
          <Scale className="w-3.5 h-3.5 text-gray-600" />
        )}
      </div>
      <div
        className={cn(
          'px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap',
          isUser
            ? 'bg-indigo-600 text-white rounded-br-md'
            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-md shadow-sm'
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
