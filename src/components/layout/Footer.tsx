import { DISCLAIMER_TEXT, EMERGENCY_CONTACTS } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="hidden md:block bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-gray-400 leading-relaxed">{DISCLAIMER_TEXT}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">
              긴급 연락처: 경찰 {EMERGENCY_CONTACTS.police} | 여성긴급전화{' '}
              {EMERGENCY_CONTACTS.womenHotline}
            </p>
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} LawLawLand. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
