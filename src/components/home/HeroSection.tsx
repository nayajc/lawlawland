import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Award, Tv, BookOpen } from 'lucide-react';
import { STATS } from '@/lib/constants';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 via-white to-white">
      <div className="max-w-5xl mx-auto px-4 pt-12 pb-12">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Profile Photo */}
          <div className="shrink-0">
            <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white">
              <Image
                src="/ohsoojin1.png"
                alt="오수진 변호사"
                width={1080}
                height={1350}
                className="w-48 md:w-64 h-auto"
                priority
              />
            </div>
          </div>

          {/* Content */}
          <div className="text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 bg-gray-100 border border-gray-200 rounded-full px-3 py-1 text-xs text-gray-700 font-medium mb-4">
              <Award className="w-3 h-3" />
              이혼전문변호사 | 법무법인 큐브
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-3">
              이혼, 혼자 고민하지 마세요
              <br />
              <span className="text-gray-900 underline decoration-2 underline-offset-4">오수진 변호사</span>가 함께합니다
            </h1>
            <p className="text-base md:text-lg text-gray-600 max-w-md mb-6 leading-[1.8]">
              고려대 법학전문대학원 박사과정 수료, 다수 방송 법률자문 출연.
              이혼 소송, 양육권, 재산분할, 위자료 분야에서 풍부한 경험으로 의뢰인의 권익을 지킵니다.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
              <Link href="/chat">
                <Button size="lg" className="bg-gray-900 hover:bg-gray-800 h-12 px-6 text-base gap-2">
                  AI 상담 시작하기
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/consult">
                <Button variant="outline" size="lg" className="h-12 px-6 text-base border-gray-300 hover:bg-gray-50">
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

        {/* 신뢰 지표 */}
        <div className="mt-10 grid grid-cols-3 gap-4 border-t border-gray-100 pt-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                className={
                  stat.value.length > 6
                    ? 'text-base md:text-lg font-bold text-gray-900 whitespace-nowrap'
                    : 'text-xl md:text-2xl font-bold text-gray-900'
                }
              >
                {stat.value}
              </div>
              <div className="mt-1 text-xs md:text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
