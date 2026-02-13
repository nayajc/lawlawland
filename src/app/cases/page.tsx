'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, X, ChevronDown } from 'lucide-react';

interface CasePost {
  id: string;
  title: string;
  category: string;
  date: string;
  url: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  '가사': 'bg-rose-50 text-rose-700 border-rose-200',
  '가사조정': 'bg-rose-50 text-rose-700 border-rose-200',
  '민사': 'bg-blue-50 text-blue-700 border-blue-200',
  '민사보전': 'bg-sky-50 text-sky-700 border-sky-200',
  '행정': 'bg-amber-50 text-amber-700 border-amber-200',
  '집행': 'bg-purple-50 text-purple-700 border-purple-200',
  '형사': 'bg-red-50 text-red-700 border-red-200',
  '소송비용': 'bg-gray-50 text-gray-700 border-gray-200',
  '기타': 'bg-gray-50 text-gray-700 border-gray-200',
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
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">주요 승소사례</h1>
        <p className="text-sm text-gray-500 mt-1">
          오수진 변호사의 주요 승소 판결 사례입니다.
          {totalCount > 0 && <span className="ml-1 text-indigo-600 font-medium">총 {totalCount}건</span>}
        </p>
      </div>

      {/* Post List */}
      {selectedPost ? (
        <div>
          <button
            onClick={() => setSelectedPost(null)}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            목록으로
          </button>

          <Card className="overflow-hidden border-gray-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
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
                  className="text-gray-400 hover:text-indigo-600 transition-colors"
                  title="새 탭에서 열기"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="text-gray-400 hover:text-gray-900 transition-colors"
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
                className="p-4 border-gray-100 hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer"
                onClick={() => setSelectedPost(post)}
              >
                <div className="flex items-start gap-3">
                  <span className={`inline-block text-[11px] px-2 py-0.5 rounded-full border font-medium shrink-0 mt-0.5 ${CATEGORY_COLORS[post.category] || CATEGORY_COLORS['기타']}`}>
                    {post.category}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 leading-snug">{post.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{post.date}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {loading && (
            <div className="text-center py-8 text-sm text-gray-400">불러오는 중...</div>
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
  );
}
