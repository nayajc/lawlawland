import type { MetadataRoute } from 'next';
import { getAllBlogPostSlugs } from '@/lib/contentful/client';
import { getAllWinCases } from '@/lib/contentful/cases';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ohsoojin.com';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/cases`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/chat`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/calculator`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/guide`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/consult`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
  ];

  // Dynamic blog post pages
  const blogSlugs = await getAllBlogPostSlugs();
  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Dynamic win case pages
  const cases = await getAllWinCases();
  const casePages: MetadataRoute.Sitemap = cases.map((c) => ({
    url: `${baseUrl}/cases/${c.slug}`,
    lastModified: new Date(c.publishedAt),
    changeFrequency: 'yearly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...blogPages, ...casePages];
}
