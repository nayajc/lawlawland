import { NextResponse } from 'next/server';
import { getAllBlogPosts } from '@/lib/contentful/client';
import { getAllWinCases } from '@/lib/contentful/cases';

const BASE_URL = 'https://ohsoojin.com';
const MAX_ITEMS = 60;

interface FeedItem {
  title: string;
  link: string;
  description: string;
  pubDate: Date;
  categories: string[];
  author?: string;
  image?: { url: string; title: string };
}

export async function GET() {
  try {
    const [posts, cases] = await Promise.all([getAllBlogPosts(), getAllWinCases()]);

    const items: FeedItem[] = [
      ...posts.map((post) => ({
        title: post.title,
        link: `${BASE_URL}/blog/${post.slug}`,
        description: post.excerpt,
        pubDate: new Date(post.publishedAt),
        categories: ['블로그', post.category, ...(post.tags ?? [])].filter((c): c is string => !!c),
        author: post.author,
        image: post.coverImage,
      })),
      ...cases.map((c) => ({
        title: `[${c.category} 승소사례] ${c.title}`,
        link: `${BASE_URL}/cases/${c.slug}`,
        description: c.summary ?? `${c.category} 승소사례. ${c.title}`,
        pubDate: new Date(c.publishedAt),
        categories: ['승소사례', c.category, ...(c.originalTag && c.originalTag !== c.category ? [c.originalTag] : [])],
        author: '오수진 변호사',
      })),
    ]
      .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
      .slice(0, MAX_ITEMS);

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>오수진 변호사 - 블로그 및 승소사례</title>
    <link>${BASE_URL}</link>
    <description>이혼전문변호사 오수진의 법률 정보 블로그와 이혼·가사·민사 승소사례를 제공합니다.</description>
    <language>ko</language>
    <copyright>© ${new Date().getFullYear()} 오수진 변호사</copyright>
    <atom:link href="${BASE_URL}/feed" rel="self" type="application/rss+xml" />
    <image>
      <url>${BASE_URL}/og-image.png</url>
      <title>오수진 변호사</title>
      <link>${BASE_URL}</link>
    </image>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items
      .map(
        (item) => `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.link}</link>
      <guid isPermaLink="true">${item.link}</guid>
      <description>${escapeXml(item.description)}</description>
      ${item.author ? `<author>${escapeXml(item.author)}</author>` : ''}
      <pubDate>${item.pubDate.toUTCString()}</pubDate>
      ${item.categories.map((c) => `<category>${escapeXml(c)}</category>`).join('')}
      ${item.image ? `<enclosure url="${item.image.url}" type="image/jpeg" />` : ''}
    </item>`,
      )
      .join('')}
  </channel>
</rss>`;

    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/xml;charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('RSS generation error:', error);
    return NextResponse.json({ error: 'Failed to generate RSS feed' }, { status: 500 });
  }
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
