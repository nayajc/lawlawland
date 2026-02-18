import { getAllBlogPosts } from '@/lib/contentful/client';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const posts = await getAllBlogPosts();
    const baseUrl = 'https://ohsoojin.com';

    // Generate RSS XML
    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>오수진 변호사 블로그</title>
    <link>${baseUrl}/blog</link>
    <description>이혼, 가사, 민사 등 다양한 법률 정보와 실무 경험을 공유합니다.</description>
    <language>ko</language>
    <copyright>© 2024 오수진 변호사</copyright>
    <atom:link href="${baseUrl}/feed" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${posts
      .map(
        (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid>${baseUrl}/blog/${post.slug}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      <author>${escapeXml(post.author)}</author>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      ${post.category ? `<category>${escapeXml(post.category)}</category>` : ''}
      ${post.tags?.map((tag) => `<category>${escapeXml(tag)}</category>`).join('') || ''}
      ${
        post.coverImage
          ? `<image>
        <url>${post.coverImage.url}</url>
        <title>${escapeXml(post.coverImage.title)}</title>
        <link>${baseUrl}/blog/${post.slug}</link>
      </image>`
          : ''
      }
    </item>
    `
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

// Helper function to escape XML special characters
function escapeXml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
