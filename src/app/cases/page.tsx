'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, X, ChevronDown } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';

interface CasePost {
  id: string;
  title: string;
  category: string;
  date: string;
  url: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  '가사': 'bg-[#E8F4FD] text-[#1B2E4B] border-[#D4E4F0]',
  '가사조정': 'bg-[#E8F4FD] text-[#1B2E4B] border-[#D4E4F0]',
  '민사': 'bg-[#ddeef9] text-[#1B2840] border-[#c4ddf0]',
  '민사보전': 'bg-[#E8F4FD] text-[#1B2E4B] border-[#D4E4F0]',
  '행정': 'bg-[#f0f7fc] text-[#5C6F8A] border-[#D4E4F0]',
  '집행': 'bg-[#ddeef9] text-[#1B2840] border-[#c4ddf0]',
  '형사': 'bg-[#1B2E4B] text-white border-[#1B2E4B]',
  '소송비용': 'bg-[#f0f7fc] text-[#5C6F8A] border-[#D4E4F0]',
  '기타': 'bg-[#f0f7fc] text-[#5C6F8A] border-[#D4E4F0]',
};

export default function CasesPage() {
  const [posts, setPosts] = useState<CasePost[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [selectedPost, setSelectedPost] = useState<CasePost | null>(null);

  const fetchPosts = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cases?page=${pageNum}`);
      if (!res.ok) return;
      const data = await res.json();
      if (!data.posts) return;
      if (pageNum === 1) {
        setPosts(data.posts);
      } else {
        setPosts((prev) => [...prev, ...data.posts]);
      }
      setTotalCount(data.totalCount);
      setHasMore(pageNum < data.totalPages);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchPosts(next);
  };

  return (
    <>
      <PageHeader
        title="주요 승소사례"
        description={totalCount > 0 ? `오수진 변호사의 주요 승소 판결 사례입니다. 총 ${totalCount}건` : '오수진 변호사의 주요 승소 판결 사례입니다.'}
      />
      <div className="max-w-3xl mx-auto px-4 pb-12">

      {/* Post List */}
      {selectedPost ? (
        <div>
          <button
            onClick={() => setSelectedPost(null)}
            className="inline-flex items-center gap-1 text-sm mb-4 transition-colors"
            style={{ color: '#5C6F8A' }}
          >
            <ArrowLeft className="w-4 h-4" />
            목록으로
          </button>

          <Card className="overflow-hidden" style={{ borderColor: '#D4E4F0' }}>
            <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid #D4E4F0', backgroundColor: '#E8F4FD' }}>
              <div className="flex-1 min-w-0">
                <span className={`inline-block text-[11px] px-2 py-0.5 rounded-full border font-medium mr-2 ${CATEGORY_COLORS[selectedPost.category] || CATEGORY_COLORS['기타']}`}>
                  {selectedPost.category}
                </span>
                <span className="text-sm font-semibold text-gray-900">{selectedPost.title}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <a
                  href={selectedPost.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors"
                  style={{ color: '#5C6F8A' }}
                  title="새 탭에서 열기"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="transition-colors"
                  style={{ color: '#5C6F8A' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <iframe
              src={selectedPost.url}
              className="w-full border-0"
              style={{ height: 'calc(100vh - 16rem)' }}
              title={selectedPost.title}
            />
          </Card>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {posts.map((post) => (
              <Card
                key={post.id}
                className="p-4 hover:shadow-md transition-all cursor-pointer"
                style={{ borderColor: '#D4E4F0' }}
                onClick={() => {
                  // 모바일에서는 iframe이 차단되므로 새 탭으로 열기
                  if (window.innerWidth < 768) {
                    window.open(post.url, '_blank');
                  } else {
                    setSelectedPost(post);
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <span className={`inline-block text-[11px] px-2 py-0.5 rounded-full border font-medium shrink-0 mt-0.5 ${CATEGORY_COLORS[post.category] || CATEGORY_COLORS['기타']}`}>
                    {post.category}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug" style={{ color: '#1B2840' }}>{post.title}</p>
                    <p className="text-xs mt-1" style={{ color: '#5C6F8A' }}>{post.date}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {loading && (
            <div className="text-center py-8 text-sm" style={{ color: '#5C6F8A' }}>불러오는 중...</div>
          )}

          {!loading && hasMore && (
            <div className="text-center mt-6">
              <Button variant="outline" onClick={loadMore} className="gap-2">
                더보기
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
      </div>
    </>
  );
}
