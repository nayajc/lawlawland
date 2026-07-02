import { getAllBlogPosts } from '@/lib/contentful/client';
import { BlogPostCard } from '@/components/blog/BlogPostCard';
import { PageHeader } from '@/components/layout/PageHeader';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '블로그 - 오수진 변호사',
  description: '이혼, 가사, 민사 등 다양한 법률 정보와 실무 경험을 공유합니다.',
  alternates: { canonical: '/blog' },
};

export const revalidate = 3600;

export default async function BlogPage() {
  const posts = await getAllBlogPosts();

  return (
    <>
      <PageHeader
        title="블로그"
        description="이혼, 가사, 민사 등 다양한 법률 정보와 실무 경험을 공유합니다."
      />
      <div className="max-w-5xl mx-auto px-4 pb-12">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg" style={{ color: '#5C6F8A' }}>아직 작성된 블로그 글이 없습니다.</p>
            <p className="text-sm mt-2" style={{ color: '#5C6F8A' }}>
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
    </>
  );
}
