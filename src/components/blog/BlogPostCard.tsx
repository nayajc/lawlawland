import Link from 'next/link';
import Image from 'next/image';
import type { BlogPostListItem } from '@/types';

interface BlogPostCardProps {
  post: BlogPostListItem;
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link href={`/blog/${post.slug}`}>
      <article className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
        {post.coverImage && (
          <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
            <Image
              src={post.coverImage.url}
              alt={post.coverImage.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        <div className="p-6">
          {post.category && (
            <span className="inline-block px-3 py-1 text-xs font-medium bg-indigo-50 text-indigo-600 rounded-full mb-3">
              {post.category}
            </span>
          )}
          <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
            {post.title}
          </h2>
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{post.author}</span>
            <time dateTime={post.publishedAt}>{formattedDate}</time>
          </div>
        </div>
      </article>
    </Link>
  );
}
