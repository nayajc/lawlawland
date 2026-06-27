import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // 네이버 검색/이미지 수집 봇
        userAgent: ['Yeti', 'NaverBot', 'Yeti-Mobile'],
        allow: '/',
        disallow: '/api/',
      },
      {
        // 다음(카카오) 검색 봇
        userAgent: 'Daum',
        allow: '/',
        disallow: '/api/',
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: '/api/',
      },
    ],
    sitemap: 'https://ohsoojin.com/sitemap.xml',
  };
}
