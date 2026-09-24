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
  metadataBase: new URL('https://ohsoojin.com'),
  title: '이혼전문변호사 오수진 | 이혼·양육권·재산분할 상담',
  description: '이혼전문변호사 오수진. 이혼 사유, 재산분할, 위자료, 양육권 상담과 승소사례와 판결문을 확인하세요.',
  keywords: ['오수진 변호사', '이혼전문변호사', '이혼', '법률 상담', 'AI 상담', '양육비', '위자료', '재산분할', '양육권', '승소사례', '법무법인 큐브'],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    title: '이혼전문변호사 오수진 | 이혼·양육권·재산분할 상담',
    description: '이혼 사유, 재산분할, 위자료, 양육권 상담과 승소사례와 판결문을 확인하세요.',
    type: 'website',
    siteName: '오수진 변호사',
    locale: 'ko_KR',
    url: 'https://ohsoojin.com',
    images: [{ url: 'https://ohsoojin.com/og-image.png', width: 1200, height: 630, alt: '이혼전문변호사 오수진' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '이혼전문변호사 오수진 | 이혼·양육권·재산분할 상담',
    description: '이혼 사유, 재산분할, 위자료, 양육권 상담과 승소사례와 판결문을 확인하세요.',
    images: ['https://ohsoojin.com/og-image.png'],
  },
  alternates: {
    canonical: 'https://ohsoojin.com',
    types: { 'application/rss+xml': 'https://ohsoojin.com/feed' },
  },
  verification: {
    other: {
      'naver-site-verification': '69bc2016ffd29d36c5854a69d5a9b342a7eb5329',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="alternate" type="application/rss+xml" href="https://ohsoojin.com/feed" title="오수진 변호사 블로그·승소사례" />
      </head>
      <body className={`${geistSans.variable} font-sans antialiased bg-gray-50`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Attorney',
              name: '오수진',
              jobTitle: '이혼전문변호사',
              url: 'https://ohsoojin.com',
              description: '이혼전문변호사 오수진. 이혼, 상간위자료, 재산분할, 양육권 소송 전문.',
              memberOf: {
                '@type': 'LegalService',
                name: '법무법인 큐브',
                address: {
                  '@type': 'PostalAddress',
                  addressLocality: '서울',
                  addressCountry: 'KR',
                },
              },
              knowsAbout: ['이혼', '재산분할', '위자료', '양육권', '상간위자료', '가사소송'],
              hasCredential: [
                { '@type': 'EducationalOccupationalCredential', credentialCategory: '변호사', dateCreated: '2012' },
                { '@type': 'EducationalOccupationalCredential', credentialCategory: '변리사', dateCreated: '2013' },
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: '오수진 변호사',
              url: 'https://ohsoojin.com',
              logo: 'https://ohsoojin.com/og-image.png',
              description: '이혼 전문 변호사 오수진의 공식 웹사이트',
              sameAs: [
                'https://www.youtube.com/@ohsoojin',
                'https://www.instagram.com/ohsoojin',
              ],
            }),
          }}
        />
        <Header />
        <main className="min-h-screen pb-20 md:pb-0">{children}</main>
        <Footer />
        <MobileNav />
      </body>
    </html>
  );
}
