import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Award, Tv, BookOpen } from 'lucide-react';
import { STATS } from '@/lib/constants';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: '#1B2E4B' }}>
      <div className="max-w-5xl mx-auto px-4 pt-12 pb-12">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Profile Photo */}
          <div className="shrink-0">
            <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white/20">
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
            <div className="inline-flex items-center gap-1.5 border border-white/20 rounded-full px-3 py-1 text-xs font-medium mb-4 tracking-wide uppercase" style={{ color: 'var(--gold-lt)' }}>
              <Award className="w-3 h-3" />
              이혼 · 양육권 · 재산분할 전문
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-3 tracking-tight">
              가장 힘든 결정 앞에서
              <br />
              <span style={{ color: 'var(--gold-lt)' }}>당신의 편</span>이 되겠습니다
            </h1>
            <p className="text-base md:text-lg text-white/60 max-w-md mb-6 leading-[1.8]">
              고려대 법학 박사과정 수료, KBS·SBS·채널A 법률 자문 출연.
              이혼 소송, 양육권, 재산분할, 위자료 — 10년간 수백 건의 경험이 당신 곁에 있습니다.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
              <Link href="/consult">
                <Button size="lg" className="text-white h-12 px-6 text-base gap-2 border-0" style={{ backgroundColor: 'var(--gold)' }}>
                  상담 신청하기
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/chat">
                <Button variant="outline" size="lg" className="h-12 px-6 text-base border-white/25 text-white/80 hover:bg-white/10 hover:text-white bg-transparent">
                  AI 법률 상담 →
                </Button>
              </Link>
            </div>

            {/* Credentials */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-white/40">
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
        <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                className={
                  stat.value.length > 6
                    ? 'text-base md:text-lg font-bold text-white whitespace-nowrap tracking-tight'
                    : 'text-xl md:text-2xl font-bold text-white tracking-tight'
                }
              >
                {stat.value}
              </div>
              <div className="mt-1 text-xs md:text-sm text-white/45">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
