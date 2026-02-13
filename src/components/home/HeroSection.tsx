import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Award, Tv, BookOpen } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white">
      <div className="max-w-5xl mx-auto px-4 pt-12 pb-12">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Profile Photo */}
          <div className="shrink-0">
            <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden shadow-lg border-4 border-white">
              <Image
                src="/lawyer-profile.png"
                alt="오수진 변호사"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Content */}
          <div className="text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1 text-xs text-indigo-600 font-medium mb-4">
              <Award className="w-3 h-3" />
              이혼전문변호사 | 법무법인 큐브
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-3">
              이혼, 혼자 고민하지 마세요
              <br />
              <span className="text-indigo-600">오수진 변호사</span>가 함께합니다
            </h1>
            <p className="text-gray-500 max-w-md mb-6 leading-relaxed">
              고려대 법학전문대학원 박사과정 수료, 다수 방송 법률자문 출연.
              이혼 소송, 양육권, 재산분할, 위자료 분야에서 풍부한 경험으로 의뢰인의 권익을 지킵니다.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
              <Link href="/chat">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 h-12 px-6 text-base gap-2">
                  AI 상담 시작하기
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/consult">
                <Button variant="outline" size="lg" className="h-12 px-6 text-base">
                  상담 신청하기
                </Button>
              </Link>
            </div>

            {/* Credentials */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                고려대 법학박사과정
              </span>
              <span className="flex items-center gap-1">
                <Tv className="w-3.5 h-3.5" />
                채널A / KBS / SBS 출연
              </span>
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                변리사 자격 보유
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
