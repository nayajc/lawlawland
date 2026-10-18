'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle, BookOpen, Phone, User, Trophy, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { href: '/about', label: '소개', icon: User },
  { href: '/cases', label: '승소사례', icon: Trophy },
  { href: '/precedents', label: '판례검색', icon: Search },
  { href: '/chat', label: 'AI 상담', icon: MessageCircle },
  { href: '/consult', label: '상담 신청', icon: Phone },
  { href: '/guide', label: '가이드', icon: BookOpen },
];

export function MobileNav() {
  const pathname = usePathname();

  // 채팅 페이지에서는 하단 네비 숨김 (입력창과 겹침 방지)
  if (pathname === '/chat') return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-gray-100 pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex items-center justify-around h-14 px-1">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 min-w-0 flex-col items-center gap-0.5 px-1 py-1 rounded-lg transition-colors',
                isActive ? 'text-gray-900' : 'text-gray-400'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive && 'stroke-[2.5]')} />
              <span className="text-[10px] font-medium whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
