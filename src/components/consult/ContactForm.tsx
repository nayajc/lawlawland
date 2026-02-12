'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { PrivacyConsent } from './PrivacyConsent';
import { useChatStore } from '@/stores/chat-store';

export function ContactForm() {
  const router = useRouter();
  const conversationId = useChatStore((s) => s.conversationId);
  const getSummaryForConsult = useChatStore((s) => s.getSummaryForConsult);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    preferredTime: '',
  });
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.phone.trim()) {
      setError('이름과 전화번호는 필수입니다.');
      return;
    }
    if (!privacyAgreed) {
      setError('개인정보 수집 및 이용에 동의해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          name: form.name,
          phone: form.phone,
          email: form.email || undefined,
          preferredTime: form.preferredTime || undefined,
          privacyAgreed: true,
          summary: getSummaryForConsult(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push('/consult/complete');
      } else {
        setError(data.message || '요청에 실패했습니다.');
      }
    } catch {
      setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 bg-white shadow-sm border-gray-100">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            이름 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="홍길동"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">
            전화번호 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="010-0000-0000"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            이메일 <span className="text-gray-400">(선택)</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="example@email.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="time" className="text-sm font-medium">
            선호 연락 시간 <span className="text-gray-400">(선택)</span>
          </Label>
          <Input
            id="time"
            value={form.preferredTime}
            onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
            placeholder="예: 오후 2시~5시"
          />
        </div>

        <PrivacyConsent agreed={privacyAgreed} onToggle={setPrivacyAgreed} />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base font-medium"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              요청 중...
            </>
          ) : (
            '변호사 상담 요청하기'
          )}
        </Button>
      </form>
    </Card>
  );
}
