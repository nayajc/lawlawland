import type { WinCaseCategory } from '@/types';

const CATEGORY_COLORS: Record<WinCaseCategory, string> = {
  '가사': 'bg-[#E8F4FD] text-[#1B2E4B] border-[#D4E4F0]',
  '민사': 'bg-[#ddeef9] text-[#1B2840] border-[#c4ddf0]',
  '보전·집행': 'bg-[#f0f7fc] text-[#5C6F8A] border-[#D4E4F0]',
  '행정': 'bg-[#f0f7fc] text-[#5C6F8A] border-[#D4E4F0]',
  '형사': 'bg-[#1B2E4B] text-white border-[#1B2E4B]',
  '기타': 'bg-[#f0f7fc] text-[#5C6F8A] border-[#D4E4F0]',
};

export function CaseCategoryBadge({ category, className = '' }: { category: WinCaseCategory; className?: string }) {
  return (
    <span className={`inline-block text-[11px] px-2 py-0.5 rounded-full border font-medium whitespace-nowrap ${CATEGORY_COLORS[category] ?? CATEGORY_COLORS['기타']} ${className}`}>
      {category}
    </span>
  );
}
