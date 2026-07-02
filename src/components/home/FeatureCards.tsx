import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { MessageCircle, Calculator, Phone } from 'lucide-react';

const features = [
  {
    href: '/chat',
    icon: MessageCircle,
    title: 'AI 법률 상담',
    description: '이혼 사유, 절차, 재산분할 등 궁금한 점을 AI에게 물어보세요',
    color: 'bg-gray-100 text-gray-700',
  },
  {
    href: '/calculator',
    icon: Calculator,
    title: '양육비 계산기',
    description: '부모 소득과 자녀 정보로 예상 양육비를 바로 확인하세요',
    color: 'bg-gray-200 text-gray-700',
  },
  {
    href: '/consult',
    icon: Phone,
    title: '오수진 변호사 상담 신청',
    description: 'AI 상담 내용을 바탕으로 오수진 변호사에게 직접 상담을 신청하세요',
    color: 'bg-gray-900 text-white',
  },
];

export function FeatureCards() {
  return (
    <section className="max-w-5xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {features.map((feat) => (
          <Link key={feat.href} href={feat.href}>
            <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer h-full bg-white" style={{ borderColor: 'var(--soft-border)' }}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${feat.color}`}>
                  <feat.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold" style={{ color: 'var(--body-text)' }}>{feat.title}</h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-fg)' }}>{feat.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
