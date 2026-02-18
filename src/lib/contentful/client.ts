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
    tags: fields.tags,
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
    tags: Array.isArray(fields.tags) ? fields.tags : undefined,
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
    });

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
    });

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
    });

    return entries.items
      .map((entry: any) => entry.fields?.slug)
      .filter((slug: any): slug is string => Boolean(slug));
  } catch (error) {
    console.error('Failed to fetch blog post slugs:', error);
    return [];
  }
}
