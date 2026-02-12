'use client';

interface PrivacyConsentProps {
  agreed: boolean;
  onToggle: (agreed: boolean) => void;
}

export function PrivacyConsent({ agreed, onToggle }: PrivacyConsentProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => onToggle(e.target.checked)}
          className="mt-1 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <span className="text-sm text-gray-700">
          <span className="font-medium text-red-500">[필수]</span> 개인정보 수집 및 이용에 동의합니다.
        </span>
      </label>
      <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 leading-relaxed">
        <p className="font-medium text-gray-600 mb-1">개인정보 수집 및 이용 안내</p>
        <ul className="space-y-0.5 list-disc list-inside">
          <li>수집 항목: 이름, 전화번호, 이메일(선택), 상담 내용 요약</li>
          <li>수집 목적: 변호사 상담 연결 및 회신</li>
          <li>보유 기간: 상담 완료 후 1년 또는 동의 철회 시 즉시 파기</li>
          <li>동의를 거부할 수 있으며, 거부 시 상담 요청이 불가합니다.</li>
        </ul>
      </div>
    </div>
  );
}
