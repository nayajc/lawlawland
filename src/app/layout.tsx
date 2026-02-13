import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '오수진 변호사 - 이혼전문변호사 AI 상담',
  description:
    '이혼전문변호사 오수진. 이혼 사유, 재산분할, 위자료, 양육권 등 이혼 관련 법률 정보를 AI 챗봇으로 쉽게 알아보세요. 법무법인 큐브 서울사무소.',
  keywords: ['오수진 변호사', '이혼전문변호사', '이혼', '법률 상담', 'AI 상담', '양육비', '위자료', '재산분할', '양육권', '법무법인 큐브'],
  openGraph: {
    title: '오수진 변호사 - 이혼전문변호사 AI 상담',
    description: '이혼전문변호사 오수진. 이혼 관련 법률 정보를 AI 챗봇으로 쉽게 알아보세요.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} font-sans antialiased bg-gray-50`}>
        <Header />
        <main className="min-h-screen pb-20 md:pb-0">{children}</main>
        <Footer />
        <MobileNav />
      </body>
    </html>
  );
}
