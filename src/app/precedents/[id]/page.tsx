import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { getPrecedent, toPlainText, LawApiError } from '@/lib/law-api';

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: '판례 상세 - 오수진 변호사',
  robots: { index: false, follow: true },
};

function Section({ title, text }: { title: string; text: string }) {
  if (!text) return null;
  return (
    <section className="mb-8">
      <h2 className="text-base font-bold mb-2" style={{ color: '#1B2840' }}>{title}</h2>
      <p className="text-sm leading-7 whitespace-pre-wrap" style={{ color: '#2E3B52' }}>{toPlainText(text)}</p>
    </section>
  );
}

export default async function PrecedentDetailPage({ params }: Props) {
  const { id } = await params;
  let p;
  try {
    p = await getPrecedent(id);
  } catch (e) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-sm text-red-600">{e instanceof LawApiError ? e.message : '판례를 불러오지 못했습니다.'}</div>;
  }
  if (!p) notFound();

  return (
    <article className="max-w-3xl mx-auto px-4 py-10">
      <Link href="/precedents" className="inline-flex items-center text-sm mb-4" style={{ color: '#5C6F8A' }}>
        <ChevronLeft size={16} /> 검색으로 돌아가기
      </Link>
      <h1 className="text-xl md:text-2xl font-bold" style={{ color: '#1B2840' }}>{p.caseName}</h1>
      <p className="text-sm mt-2 mb-8" style={{ color: '#5C6F8A' }}>
        {p.court} · {p.caseNumber} · {p.date} {p.judgmentType}
      </p>
      <Section title="판시사항" text={p.issue} />
      <Section title="판결요지" text={p.summary} />
      <Section title="참조조문" text={p.refStatutes} />
      <Section title="참조판례" text={p.refCases} />
      <Section title="판례내용" text={p.content} />
      <p className="text-xs mt-10" style={{ color: '#8A97AB' }}>출처: 국가법령정보센터. 본 정보는 참고용이며 법률 자문이 아닙니다.</p>
    </article>
  );
}
