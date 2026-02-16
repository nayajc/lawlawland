import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getBlogPostBySlug, getAllBlogPostSlugs } from '@/lib/contentful/client';
import { RichTextRenderer } from '@/components/blog/RichTextRenderer';
import type { Metadata } from 'next';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllBlogPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: '블로그 글을 찾을 수 없습니다 - 오수진 변호사',
    };
  }

  return {
    title: `${post.title} - 오수진 변호사 블로그`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [{ url: post.coverImage.url }] : [],
    },
  };
}

export const revalidate = 3600; // Revalidate every hour

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const formattedDate = new Date(post.publishedAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        블로그 목록으로 돌아가기
      </Link>

      <article>
        {post.coverImage && (
          <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
            <Image
              src={post.coverImage.url}
              alt={post.coverImage.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}

        <header className="mb-8">
          {post.category && (
            <span className="inline-block px-3 py-1 text-sm font-medium bg-indigo-50 text-indigo-600 rounded-full mb-4">
              {post.category}
            </span>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-gray-600">
            <span className="font-medium">{post.author}</span>
            <span>•</span>
            <time dateTime={post.publishedAt}>{formattedDate}</time>
          </div>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="border-t border-gray-200 pt-8">
          <RichTextRenderer content={post.content} />
        </div>
      </article>

      <div className="mt-12 pt-8 border-t border-gray-200">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          블로그 목록으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
