'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
    <header className="sticky top-0 z-50 backdrop-blur-md border-b" style={{ backgroundColor: 'color-mix(in oklch, var(--pure-white) 90%, transparent)', borderColor: 'var(--soft-border)' }}>
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded flex items-center justify-center" style={{ border: '1px solid var(--gold)' }}>
            <span className="text-[11px] font-bold tracking-tight" style={{ color: 'var(--gold)' }}>OSJ</span>
          </div>
          <div>
            <div className="font-bold text-base leading-none tracking-tight" style={{ color: 'var(--body-text)' }}>오수진 변호사</div>
            <div className="text-[10px] tracking-wide mt-0.5" style={{ color: 'var(--muted-fg)' }}>이혼 · 가사 전문</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-0">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 text-sm transition-colors"
              style={{
                color: pathname === item.href ? '#1B2E4B' : 'var(--muted-fg)',
                fontWeight: pathname === item.href ? '600' : '400',
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href="/consult" className="hidden md:block">
          <button className="text-white text-sm font-semibold px-4 py-2 rounded-md transition-colors" style={{ backgroundColor: '#1B2E4B' }}>
            상담 신청
          </button>
        </Link>
      </div>
    </header>
  );
}
