import { Card } from '@/components/ui/card';
import { Award, Briefcase, Scale, Tv, BookOpen } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '변호사 소개 - 오수진 변호사',
  description: '이혼전문변호사 오수진의 자격, 경력, 전문 분야, 방송 활동을 소개합니다.',
};

const qualifications = [
  '변호사 자격취득 (2012)',
  '변리사 자격취득 (2013)',
];

const career = [
  { label: '現 법무법인 큐브 대표변호사', current: true },
  { label: '前 법률사무소 이스트 변호사', current: false },
  { label: '前 법률사무소 누림 변호사', current: false },
  { label: '前 법무법인 삼화 변호사', current: false },
  { label: '前 법무법인 대광 변호사', current: false },
];

const expertise = [
  '이혼, 상간위자료 소송 전문',
  '가사법 민사법 전문 변호사 등록 (대한변호사협회)',
  '한국민간항공조종사협회 고문 변호사',
  '민사, 가사, 형사, 행정, 지식재산권 계약자문 등 다수 소송, 자문 건의 성과',
  '서울특별시 공익변호사',
  '365의원 고문 변호사',
];

const broadcasts = [
  'SBS 모닝와이드 \'누구를 위한 법\', \'맨인블랙박스\' 등 법률 자문, 인터뷰',
  'SBS 생활경제 법률자문, 인터뷰',
  'KBS1 아침마당 출연',
  'KBS2 생방송 아침이 좋다 법률자문, 인터뷰',
  'MBC 경제매거진 M, 생방송 오늘아침 법률자문, 인터뷰',
  'MBC TV 연예통신 법률자문, 인터뷰',
  'OBS 독특한 연예뉴스 법률자문, 인터뷰',
  'TV로펌 법대법 출연',
  'iTV 산업방송 \'청바지\'(청년이 바라는 지금) 출연',
  'XNM \'코드제로\' 출연',
  'KTV 정책 버라이어티 토크 고정 패널',
  'KTV 정책 토크, 박혜진의 정책엔 고정 패널',
];

const sections = [
  {
    title: '자격',
    icon: Award,
    items: qualifications,
  },
  {
    title: '경력',
    icon: Briefcase,
    items: career.map((c) => c.label),
    highlight: 0,
  },
  {
    title: '전문 분야 및 활동',
    icon: Scale,
    items: expertise,
  },
  {
    title: '방송 활동',
    icon: Tv,
    items: broadcasts,
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1 text-xs text-indigo-600 font-medium mb-3">
          <BookOpen className="w-3 h-3" />
          법무법인 큐브 서울사무소
        </div>
        <h1 className="text-2xl font-bold text-gray-900">오수진 변호사 소개</h1>
        <p className="text-sm text-gray-500 mt-1">
          고려대 법학전문대학원 박사과정 수료 | 이혼전문변호사
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <Card key={section.title} className="p-6 border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <section.icon className="w-4 h-4 text-indigo-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">{section.title}</h2>
            </div>
            <ul className="space-y-2.5">
              {section.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-indigo-400 mt-0.5 shrink-0">&#8226;</span>
                  <span className={section.highlight === i ? 'font-semibold text-indigo-700' : ''}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
