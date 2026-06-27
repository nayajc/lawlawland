'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Scale } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/about', label: '변호사 소개' },
  { href: '/cases', label: '승소사례' },
  { href: '/blog', label: '블로그' },
  { href: '/chat', label: 'AI 상담' },
  { href: '/calculator', label: '양육비 계산' },
  { href: '/guide', label: '이혼 가이드' },
  { href: '/consult', label: '상담 신청' },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900">오수진 변호사</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
