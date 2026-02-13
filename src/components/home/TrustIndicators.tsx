import { Shield, Lock, AlertTriangle } from 'lucide-react';
import { DISCLAIMER_TEXT } from '@/lib/constants';

export function TrustIndicators() {
  return (
    <section className="max-w-5xl mx-auto px-4 pb-16">
      <div className="bg-gray-50 rounded-2xl p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-800 mb-1">법률 정보 안내</p>
              <p className="text-xs text-gray-500 leading-relaxed">{DISCLAIMER_TEXT}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-800 mb-1">개인정보 보호</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                상담 내용은 암호화되어 안전하게 보관됩니다. 개인정보는 상담 목적으로만 사용됩니다.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-800 mb-1">오수진 변호사 직접 상담</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                AI 상담 후 필요시 오수진 변호사에게 직접 상담을 연결해드립니다. 대화 내용이 함께 전달됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
