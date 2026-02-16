import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
          <FileQuestion className="w-10 h-10 text-gray-400" />
        </div>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">블로그 글을 찾을 수 없습니다</h1>
      <p className="text-gray-600 mb-8">
        요청하신 블로그 글이 존재하지 않거나 삭제되었습니다.
      </p>
      <Link
        href="/blog"
        className="inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
      >
        블로그 목록으로 돌아가기
      </Link>
    </div>
  );
}
