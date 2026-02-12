import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MessageCircle, ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white">
      <div className="max-w-5xl mx-auto px-4 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1 text-xs text-indigo-600 font-medium mb-6">
          <MessageCircle className="w-3 h-3" />
          AI 법률 정보 서비스
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
          이혼, 혼자 고민하지 마세요
          <br />
          <span className="text-indigo-600">AI가 함께합니다</span>
        </h1>
        <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
          이혼 사유, 재산분할, 양육권 등 궁금한 법률 정보를
          <br className="hidden sm:block" />
          AI 챗봇과 대화하며 쉽게 알아보세요.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/chat">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 h-12 px-6 text-base gap-2">
              AI 상담 시작하기
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/calculator">
            <Button variant="outline" size="lg" className="h-12 px-6 text-base">
              양육비 계산하기
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
