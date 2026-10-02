import { createClient } from 'contentful';
import type { BlogPost, BlogPostListItem } from '@/types';

const spaceId = process.env.CONTENTFUL_SPACE_ID || '';
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN || '';

const hasValidCredentials = spaceId && accessToken &&
  spaceId !== 'your-space-id' &&
  accessToken !== 'your-access-token';

if (!hasValidCredentials) {
  console.warn('Contentful credentials not configured. Blog features will not work.');
}

export const contentfulClient = hasValidCredentials ? createClient({
  space: spaceId,
  accessToken: accessToken,
}) : null;

/** 발행 예약: publishedAt이 현재보다 미래인 글은 Contentful에 publish되어 있어도 노출하지 않는다. */
const publishedNow = () => ({ 'fields.publishedAt[lte]': new Date().toISOString() });

/** tags는 Symbol 필드라 "a, b, c" 문자열로 저장돼 있다. 배열로 정규화한다. */
function normalizeTags(tags: unknown): string[] | undefined {
  const list = Array.isArray(tags)
    ? tags
    : typeof tags === 'string'
      ? tags.split(',')
      : [];
  const cleaned = list.map((t) => String(t).trim()).filter(Boolean);
  return cleaned.length > 0 ? cleaned : undefined;
}

function mapEntryToBlogPost(entry: any): BlogPost {
  const fields = entry.fields;
  return {
    slug: fields.slug,
    title: fields.title,
    excerpt: fields.excerpt,
    content: fields.content,
    coverImage: fields.coverImage
      ? {
          url: `https:${fields.coverImage.fields.file.url}`,
          title: fields.coverImage.fields.title,
          description: fields.coverImage.fields.description,
        }
      : undefined,
    author: fields.author,
    publishedAt: fields.publishedAt,
    category: fields.category,
    tags: normalizeTags(fields.tags),
  };
}

function mapEntryToBlogPostListItem(entry: any): BlogPostListItem {
  const fields = entry.fields;
  return {
    slug: fields.slug,
    title: fields.title,
    excerpt: fields.excerpt,
    coverImage: fields.coverImage
      ? {
          url: `https:${fields.coverImage.fields.file.url}`,
          title: fields.coverImage.fields.title,
        }
      : undefined,
    author: fields.author,
    publishedAt: fields.publishedAt,
    category: fields.category,
    tags: normalizeTags(fields.tags),
  };
}

export async function getAllBlogPosts(): Promise<BlogPostListItem[]> {
  if (!contentfulClient) {
    return [];
  }

  try {
    const entries = await contentfulClient.getEntries({
      content_type: 'blogPost',
      order: ['-fields.publishedAt'],
      ...publishedNow(),
    } as any);

    return entries.items.map(mapEntryToBlogPostListItem);
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    return [];
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!contentfulClient) {
    return null;
  }

  try {
    const entries = await contentfulClient.getEntries({
      content_type: 'blogPost',
      'fields.slug': slug,
      limit: 1,
      ...publishedNow(),
    } as any);

    if (entries.items.length === 0) {
      return null;
    }

    return mapEntryToBlogPost(entries.items[0]);
  } catch (error) {
    console.error(`Failed to fetch blog post with slug "${slug}":`, error);
    return null;
  }
}

export async function getAllBlogPostSlugs(): Promise<string[]> {
  if (!contentfulClient) {
    return [];
  }

  try {
    const entries = await contentfulClient.getEntries({
      content_type: 'blogPost',
      select: ['fields.slug'],
      ...publishedNow(),
    } as any);

    return entries.items
      .map((entry: any) => entry.fields?.slug)
      .filter((slug: any): slug is string => Boolean(slug));
  } catch (error) {
    console.error('Failed to fetch blog post slugs:', error);
    return [];
  }
}
