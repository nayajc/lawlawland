'use client';

import { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { DISCLAIMER_TEXT } from '@/lib/constants';

export function DisclaimerBanner() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="bg-amber-50 border-b border-amber-100">
      <div className="max-w-3xl mx-auto px-4">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-between py-2 text-left"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="text-xs text-amber-700 font-medium">법률 정보 안내</span>
          </div>
          {isCollapsed ? (
            <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
          )}
        </button>
        {!isCollapsed && (
          <p className="text-xs text-amber-600 leading-relaxed pb-2">{DISCLAIMER_TEXT}</p>
        )}
      </div>
    </div>
  );
}
