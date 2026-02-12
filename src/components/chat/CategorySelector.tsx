'use client';

import { CATEGORIES } from '@/lib/constants';
import type { ChatCategory } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CategorySelectorProps {
  selected: ChatCategory;
  onSelect: (category: ChatCategory) => void;
}

export function CategorySelector({ selected, onSelect }: CategorySelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-3">
      {CATEGORIES.map((cat) => (
        <Badge
          key={cat.id}
          variant={selected === cat.id ? 'default' : 'outline'}
          className={cn(
            'cursor-pointer whitespace-nowrap px-3 py-1.5 text-xs font-medium transition-all shrink-0',
            selected === cat.id
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600'
              : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-200'
          )}
          onClick={() => onSelect(cat.id)}
        >
          {cat.label}
        </Badge>
      ))}
    </div>
  );
}
