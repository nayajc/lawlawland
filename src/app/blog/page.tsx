import { getAllBlogPosts } from '@/lib/contentful/client';
import { BlogPostCard } from '@/components/blog/BlogPostCard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '블로그 - 오수진 변호사',
  description: '이혼, 가사, 민사 등 다양한 법률 정보와 실무 경험을 공유합니다.',
};

export const revalidate = 3600; // Revalidate every hour

export default async function BlogPage() {
  const posts = await getAllBlogPosts();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">블로그</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          이혼, 가사, 민사 등 다양한 법률 정보와 실무 경험을 공유합니다.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">아직 작성된 블로그 글이 없습니다.</p>
          <p className="text-gray-400 text-sm mt-2">
            Contentful에서 블로그 포스트를 작성해주세요.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
