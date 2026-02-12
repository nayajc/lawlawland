'use client';

import { useState } from 'react';
import { calculateChildSupport, AGE_OPTIONS } from '@/lib/calculator/child-support';
import { ResultCard } from './ResultCard';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function ChildSupportCalc() {
  const [fatherIncome, setFatherIncome] = useState(300);
  const [motherIncome, setMotherIncome] = useState(200);
  const [childrenCount, setChildrenCount] = useState(1);
  const [childAge, setChildAge] = useState<'young' | 'elementary' | 'middle' | 'high'>('elementary');

  const result = calculateChildSupport({ fatherIncome, motherIncome, childrenCount, childAge });

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white shadow-sm border-gray-100">
        <div className="space-y-6">
          {/* 부 소득 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700">부(아버지) 월 소득</Label>
              <span className="text-sm font-bold text-indigo-600">{fatherIncome}만원</span>
            </div>
            <Slider
              value={[fatherIncome]}
              onValueChange={([v]) => setFatherIncome(v)}
              min={0}
              max={1500}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>0</span>
              <span>500만원</span>
              <span>1,000만원</span>
              <span>1,500만원</span>
            </div>
          </div>

          {/* 모 소득 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700">모(어머니) 월 소득</Label>
              <span className="text-sm font-bold text-indigo-600">{motherIncome}만원</span>
            </div>
            <Slider
              value={[motherIncome]}
              onValueChange={([v]) => setMotherIncome(v)}
              min={0}
              max={1500}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>0</span>
              <span>500만원</span>
              <span>1,000만원</span>
              <span>1,500만원</span>
            </div>
          </div>

          {/* 자녀 수 */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">자녀 수</Label>
            <div className="flex gap-2">
              {[1, 2, 3].map((n) => (
                <Badge
                  key={n}
                  variant={childrenCount === n ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer px-4 py-2 text-sm',
                    childrenCount === n
                      ? 'bg-indigo-600 hover:bg-indigo-700'
                      : 'hover:bg-gray-50'
                  )}
                  onClick={() => setChildrenCount(n)}
                >
                  {n}명{n >= 3 ? ' 이상' : ''}
                </Badge>
              ))}
            </div>
          </div>

          {/* 자녀 연령대 */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">자녀 연령대</Label>
            <div className="grid grid-cols-2 gap-2">
              {AGE_OPTIONS.map((opt) => (
                <Badge
                  key={opt.value}
                  variant={childAge === opt.value ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer px-3 py-2 text-xs justify-center',
                    childAge === opt.value
                      ? 'bg-indigo-600 hover:bg-indigo-700'
                      : 'hover:bg-gray-50'
                  )}
                  onClick={() => setChildAge(opt.value)}
                >
                  {opt.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <ResultCard result={result} />
    </div>
  );
}
