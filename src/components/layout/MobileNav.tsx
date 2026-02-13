'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle, Calculator, BookOpen, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { href: '/chat', label: 'AI 상담', icon: MessageCircle },
  { href: '/calculator', label: '양육비 계산', icon: Calculator },
  { href: '/guide', label: '가이드', icon: BookOpen },
  { href: '/consult', label: '변호사 상담', icon: Phone },
];

export function MobileNav() {
  const pathname = usePathname();

  // 채팅 페이지에서는 하단 네비 숨김 (입력창과 겹침 방지)
  if (pathname === '/chat') return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-gray-100 pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex items-center justify-around h-14 px-2">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors min-w-[64px]',
                isActive ? 'text-indigo-600' : 'text-gray-400'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive && 'stroke-[2.5]')} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
