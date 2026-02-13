import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '상담 요청 완료 - 오수진 변호사',
};

export default function ConsultCompletePage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-green-500" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">상담 요청이 완료되었습니다</h1>
      <p className="text-gray-500 mb-2">
        오수진 변호사가 영업일 기준 1~2일 이내에 연락드릴 예정입니다.
      </p>
      <p className="text-sm text-gray-400 mb-8">
        AI 상담 대화 내용을 오수진 변호사에게 이메일로 전달하였습니다.
      </p>
      <div className="flex gap-3 justify-center">
        <Link href="/">
          <Button variant="outline">홈으로 돌아가기</Button>
        </Link>
        <Link href="/chat">
          <Button className="bg-indigo-600 hover:bg-indigo-700">AI 상담 계속하기</Button>
        </Link>
      </div>
    </div>
  );
}
