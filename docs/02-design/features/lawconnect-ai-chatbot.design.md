# Design: LawConnect AI Chatbot

> Plan 문서 기반 상세 설계 | Feature: lawconnect-ai-chatbot

## 1. Project Structure

```
lawlawland/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root Layout (fonts, metadata)
│   │   ├── page.tsx                  # 홈 (랜딩 페이지)
│   │   ├── globals.css               # Global styles
│   │   ├── chat/
│   │   │   └── page.tsx              # AI 상담 챗봇 메인
│   │   ├── calculator/
│   │   │   └── page.tsx              # 양육비 계산기
│   │   ├── guide/
│   │   │   └── page.tsx              # 이혼 가이드 (정보 콘텐츠)
│   │   ├── consult/
│   │   │   ├── page.tsx              # 변호사 상담 요청 폼
│   │   │   └── complete/
│   │   │       └── page.tsx          # 상담 요청 완료
│   │   └── api/
│   │       ├── chat/
│   │       │   └── route.ts          # AI 챗봇 스트리밍 API
│   │       └── consult/
│   │           └── route.ts          # 상담 요청 + 이메일 발송 API
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx            # 공통 헤더/네비게이션
│   │   │   ├── Footer.tsx            # 공통 푸터
│   │   │   └── MobileNav.tsx         # 모바일 하단 네비게이션
│   │   ├── chat/
│   │   │   ├── ChatContainer.tsx     # 채팅 영역 컨테이너
│   │   │   ├── MessageBubble.tsx     # 메시지 버블 (사용자/AI)
│   │   │   ├── ChatInput.tsx         # 메시지 입력 영역
│   │   │   ├── CategorySelector.tsx  # 상담 카테고리 선택 칩
│   │   │   ├── TypingIndicator.tsx   # AI 입력 중 표시
│   │   │   ├── DisclaimerBanner.tsx  # 면책 조항 배너
│   │   │   └── ConsultCTA.tsx        # "변호사 상담 받기" CTA 버튼
│   │   ├── calculator/
│   │   │   ├── ChildSupportCalc.tsx  # 양육비 계산기 컴포넌트
│   │   │   ├── InputSlider.tsx       # 슬라이더 입력 UI
│   │   │   └── ResultCard.tsx        # 계산 결과 카드
│   │   ├── consult/
│   │   │   ├── ContactForm.tsx       # 연락처 입력 폼
│   │   │   ├── ChatSummary.tsx       # AI 상담 요약 미리보기
│   │   │   └── PrivacyConsent.tsx    # 개인정보 동의 체크박스
│   │   ├── home/
│   │   │   ├── HeroSection.tsx       # 히어로 섹션
│   │   │   ├── FeatureCards.tsx      # 기능 소개 카드
│   │   │   └── TrustIndicators.tsx   # 신뢰 지표 (면책조항 포함)
│   │   └── ui/                       # shadcn/ui 컴포넌트
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── badge.tsx
│   │       ├── dialog.tsx
│   │       ├── slider.tsx
│   │       └── ...
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── client.ts             # AI API 클라이언트 (Claude/GPT-4)
│   │   │   ├── prompts.ts            # System Prompts (카테고리별)
│   │   │   ├── summarizer.ts         # 상담 내용 요약 생성
│   │   │   └── categories.ts         # 상담 카테고리 정의
│   │   ├── supabase/
│   │   │   ├── client.ts             # Supabase 클라이언트 (브라우저)
│   │   │   ├── server.ts             # Supabase 서버 클라이언트
│   │   │   └── types.ts              # DB 타입 정의
│   │   ├── email/
│   │   │   ├── resend.ts             # Resend 클라이언트
│   │   │   └── templates.ts          # 이메일 HTML 템플릿
│   │   ├── calculator/
│   │   │   └── child-support.ts      # 양육비 산정 로직
│   │   └── constants.ts              # 상수 정의
│   ├── stores/
│   │   └── chat-store.ts             # Zustand 채팅 상태 관리
│   └── types/
│       └── index.ts                  # 공통 타입 정의
├── public/
│   ├── og-image.png                  # OG 이미지
│   └── favicon.ico
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql    # DB 마이그레이션
├── .env.local                        # 환경변수 (로컬)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 2. Database Design (Supabase)

### 2.1 SQL Schema

```sql
-- conversations: 상담 세션
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_conversations_session ON conversations(session_id);
CREATE INDEX idx_conversations_created ON conversations(created_at DESC);

-- consultation_requests: 변호사 상담 요청
CREATE TABLE consultation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  preferred_time TEXT,
  privacy_agreed BOOLEAN NOT NULL DEFAULT false,
  summary TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  email_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_requests_status ON consultation_requests(status);

-- lawyers: 변호사 정보
CREATE TABLE lawyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  specialty TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true
);

-- RLS 정책: consultation_requests는 서버 사이드에서만 접근
ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE lawyers ENABLE ROW LEVEL SECURITY;

-- conversations는 session_id 기반 접근 허용
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow session-based access" ON conversations
  FOR ALL USING (true);
```

### 2.2 messages JSONB 구조

```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  category?: string;
  timestamp: string;
}

// conversations.messages 예시
[
  { "id": "msg_1", "role": "user", "content": "이혼 절차가 어떻게 되나요?", "timestamp": "..." },
  { "id": "msg_2", "role": "assistant", "content": "이혼은 크게 협의이혼과...", "category": "procedure", "timestamp": "..." }
]
```

## 3. Component Design

### 3.1 페이지별 컴포넌트 매핑

```
[홈 페이지] /
├── Header
├── HeroSection          → "이혼, 혼자 고민하지 마세요" + CTA 버튼
├── FeatureCards          → AI 상담 / 양육비 계산 / 변호사 연결
├── TrustIndicators      → 면책 조항 + 보안 안내
└── Footer

[AI 상담] /chat
├── Header
├── DisclaimerBanner     → 상단 면책 조항 (접기 가능)
├── CategorySelector     → 카테고리 칩 (이혼사유/재산분할/양육권...)
├── ChatContainer
│   ├── MessageBubble[]  → 대화 버블 목록
│   └── TypingIndicator  → AI 응답 대기 중
├── ChatInput            → 메시지 입력 + 전송
├── ConsultCTA           → 하단 "변호사에게 상담 요청" 플로팅 버튼
└── MobileNav

[양육비 계산기] /calculator
├── Header
├── ChildSupportCalc
│   ├── InputSlider      → 부 소득 / 모 소득
│   ├── 자녀 수/연령 선택
│   └── ResultCard       → 예상 월 양육비 범위
├── DisclaimerBanner     → 면책 조항
└── Footer

[상담 요청] /consult
├── Header
├── ChatSummary          → AI 상담 요약 미리보기
├── ContactForm          → 이름, 전화번호, 이메일, 선호시간
├── PrivacyConsent       → 개인정보 동의
└── 제출 버튼 → POST /api/consult

[상담 완료] /consult/complete
├── 완료 아이콘 + 메시지
├── 예상 회신 안내
└── 홈으로 돌아가기 버튼
```

### 3.2 핵심 컴포넌트 인터페이스

```typescript
// ChatContainer.tsx
interface ChatContainerProps {
  initialCategory?: string;
}

// MessageBubble.tsx
interface MessageBubbleProps {
  message: ChatMessage;
  isLatest: boolean;
}

// ChatInput.tsx
interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

// CategorySelector.tsx
interface CategorySelectorProps {
  selected: string | null;
  onSelect: (category: string) => void;
}

// ContactForm.tsx
interface ContactFormProps {
  conversationId: string;
  summary: string;
  onSubmit: (data: ConsultationRequest) => Promise<void>;
}

// ChildSupportCalc.tsx
interface ChildSupportCalcProps {
  // No props - self-contained with internal state
}
```

## 4. API Design

### 4.1 AI Chat Streaming API

```
POST /api/chat
Content-Type: application/json

Request:
{
  "messages": ChatMessage[],
  "category": string,
  "sessionId": string
}

Response: ReadableStream (text/event-stream)
data: {"content": "이혼은 크게...", "done": false}
data: {"content": "", "done": true, "category": "procedure"}
```

**구현 핵심:**
- Vercel AI SDK (`ai` 패키지) 활용한 스트리밍
- `streamText()` with Claude API
- 카테고리별 System Prompt 주입
- 응답 끝에 면책 조항 자동 추가

```typescript
// /api/chat/route.ts 핵심 로직
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { getSystemPrompt } from '@/lib/ai/prompts';

export async function POST(req: Request) {
  const { messages, category, sessionId } = await req.json();

  const result = streamText({
    model: anthropic('claude-sonnet-4-5-20250929'),
    system: getSystemPrompt(category),
    messages,
  });

  return result.toDataStreamResponse();
}
```

### 4.2 Consultation Request API

```
POST /api/consult
Content-Type: application/json

Request:
{
  "conversationId": "uuid",
  "name": "홍길동",
  "phone": "010-1234-5678",
  "email": "user@example.com",      // optional
  "preferredTime": "오후 2-5시",      // optional
  "privacyAgreed": true,
  "summary": "AI가 생성한 상담 요약"
}

Response:
{
  "success": true,
  "requestId": "uuid",
  "message": "상담 요청이 접수되었습니다."
}
```

**처리 플로우:**
1. Supabase에 `consultation_requests` INSERT
2. `lawyers` 테이블에서 active 변호사 조회
3. Resend API로 변호사에게 이메일 발송
4. status를 `sent`로 업데이트, email_sent_at 기록
5. (선택) 사용자 이메일로 확인 메일 발송

## 5. AI Prompt Design

### 5.1 Base System Prompt

```typescript
const BASE_SYSTEM_PROMPT = `
당신은 "로코넥트 AI"입니다. 대한민국 이혼 관련 법률 정보를 친근하고 이해하기 쉽게 안내하는 AI 도우미입니다.

## 핵심 원칙
1. 일반적인 법률 "정보"만 제공합니다. 절대 법률 "조언"이나 "자문"을 하지 않습니다.
2. 사용자의 구체적 상황에 대해 "~하세요", "~해야 합니다"라는 지시형 표현을 사용하지 않습니다.
3. 대신 "일반적으로 ~하는 경우가 많습니다", "법원에서는 ~를 고려합니다"와 같은 정보 제공 형태로 답변합니다.
4. 사안이 복잡하거나 구체적 조언이 필요한 경우 반드시 "전문 변호사 상담을 권해드립니다"로 안내합니다.
5. 따뜻하고 공감적인 톤을 유지하되, 전문성 있는 정보를 제공합니다.
6. 폭력, 자해, 극단적 감정 표현 감지 시 즉시 긴급 연락처(112, 1366 여성긴급전화)를 안내합니다.

## 응답 형식
- 핵심 내용을 먼저 간결하게 답변
- 필요시 항목별로 정리
- 답변 마지막에 관련 추가 질문 1-2개 제안
- 과도하게 길지 않게 (300자 이내 권장)

## 면책
모든 응답의 맥락에 "본 정보는 일반적인 법률 정보이며, 개별 사안에 대한 법률 조언이 아닙니다"를 포함합니다.
`;
```

### 5.2 카테고리별 추가 프롬프트

```typescript
const CATEGORY_PROMPTS: Record<string, string> = {
  'divorce-reason': `
    이혼 사유에 관한 질문입니다.
    민법 제840조(재판상 이혼 사유)를 기준으로 답변하세요.
    협의이혼은 사유 불문, 재판이혼은 6가지 법정 사유가 있음을 안내하세요.
  `,
  'property': `
    재산분할에 관한 질문입니다.
    민법 제839조의2를 기준으로 답변하세요.
    기여도, 혼인기간, 특유재산/공동재산 구분을 설명하세요.
  `,
  'alimony': `
    위자료에 관한 질문입니다.
    위자료는 정신적 손해배상임을 명확히 하고,
    산정 시 고려 요소(혼인기간, 과실 정도, 재산 상태 등)를 안내하세요.
  `,
  'custody': `
    양육권/면접교섭권에 관한 질문입니다.
    자녀의 복리를 최우선으로 고려한다는 점을 강조하세요.
    양육비 산정기준표의 존재를 안내하세요.
  `,
  'general': `
    이혼 관련 일반적인 질문입니다.
    질문 내용을 파악하여 적절한 카테고리로 안내하세요.
  `,
};
```

## 6. State Management (Zustand)

```typescript
// stores/chat-store.ts
interface ChatStore {
  // State
  messages: ChatMessage[];
  category: string | null;
  sessionId: string;
  isLoading: boolean;
  conversationId: string | null;

  // Actions
  addMessage: (message: ChatMessage) => void;
  setCategory: (category: string) => void;
  setLoading: (loading: boolean) => void;
  setConversationId: (id: string) => void;
  clearChat: () => void;
  getSummaryForConsult: () => string;
}
```

## 7. Email Template Design

### 7.1 변호사용 이메일

```
제목: [LawConnect] 새 상담 요청 - {카테고리명}

본문:
──────────────────────────
LawConnect AI 상담 요청
──────────────────────────

■ 신청인 정보
  - 이름: {name}
  - 연락처: {phone}
  - 이메일: {email || '미제공'}
  - 선호 연락 시간: {preferredTime || '무관'}

■ AI 상담 요약
  - 카테고리: {category}
  - 상담 일시: {date}

  {AI 생성 상담 요약 내용}

■ 주요 쟁점
  {AI가 파악한 핵심 쟁점 리스트}

──────────────────────────
이 메일은 LawConnect AI에서 자동 발송되었습니다.
```

### 7.2 사용자용 확인 이메일 (선택)

```
제목: [LawConnect] 변호사 상담 요청이 접수되었습니다

본문:
{name}님, 안녕하세요.

변호사 상담 요청이 정상적으로 접수되었습니다.
담당 변호사가 영업일 기준 1-2일 이내 연락드릴 예정입니다.

■ 요청 정보
  - 상담 카테고리: {category}
  - 요청 일시: {date}
  - 요청 번호: {requestId}

문의사항이 있으시면 언제든 LawConnect를 방문해주세요.
```

## 8. Design System

### 8.1 Color Tokens

```typescript
const colors = {
  // Primary - Warm Indigo
  primary: {
    50:  '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',  // main
    600: '#4F46E5',  // primary action
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },
  // Accent - Soft Amber
  accent: {
    50:  '#FFFBEB',
    100: '#FEF3C7',
    400: '#FBBF24',
    500: '#F59E0B',  // main
    600: '#D97706',
  },
  // Semantic
  background: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceHover: '#F3F4F6',
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    muted: '#9CA3AF',
  },
  // Chat bubbles
  chat: {
    user: '#4F46E5',      // Primary indigo
    userText: '#FFFFFF',
    ai: '#F3F4F6',        // Light gray
    aiText: '#111827',
  },
  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
};
```

### 8.2 Typography

```css
/* Pretendard - 본문 */
--font-body: 'Pretendard Variable', -apple-system, sans-serif;

/* Noto Serif KR - 법률 인용, 강조 */
--font-serif: 'Noto Serif KR', serif;

/* Scale */
--text-xs: 0.75rem;    /* 12px - 보조 텍스트 */
--text-sm: 0.875rem;   /* 14px - 캡션, 면책조항 */
--text-base: 1rem;     /* 16px - 본문, 채팅 메시지 */
--text-lg: 1.125rem;   /* 18px - 소제목 */
--text-xl: 1.25rem;    /* 20px - 섹션 제목 */
--text-2xl: 1.5rem;    /* 24px - 페이지 제목 */
--text-3xl: 1.875rem;  /* 30px - 히어로 제목 */
```

### 8.3 Spacing & Layout

```css
/* Border Radius */
--radius-sm: 0.375rem;    /* 6px - 입력 필드 */
--radius-md: 0.5rem;      /* 8px - 카드 */
--radius-lg: 0.75rem;     /* 12px - 모달 */
--radius-xl: 1rem;        /* 16px - 채팅 버블 */
--radius-full: 9999px;    /* 칩, 아바타 */

/* Max Width */
--max-width-chat: 768px;  /* 채팅 영역 */
--max-width-page: 1024px; /* 페이지 컨테이너 */

/* Chat Bubble */
--bubble-max-width: 80%;  /* 모바일 */
--bubble-padding: 12px 16px;
```

## 9. Implementation Order

구현 우선순위 (MVP 기준):

```
Phase 1: 프로젝트 셋업
├── [1-1] Next.js 15 프로젝트 생성 + Tailwind + shadcn/ui
├── [1-2] Supabase 프로젝트 생성 + DB 마이그레이션
├── [1-3] 환경변수 설정 (.env.local)
└── [1-4] 기본 레이아웃 (Header, Footer, MobileNav)

Phase 2: AI 챗봇 코어
├── [2-1] AI 클라이언트 + System Prompts 작성
├── [2-2] /api/chat 스트리밍 API 구현
├── [2-3] ChatContainer + MessageBubble + ChatInput
├── [2-4] CategorySelector + 카테고리별 상담
├── [2-5] TypingIndicator + 면책조항 배너
└── [2-6] Zustand store + Supabase 대화 저장

Phase 3: 양육비 계산기
├── [3-1] 양육비 산정 기준표 데이터 + 계산 로직
├── [3-2] ChildSupportCalc UI (슬라이더, 결과 카드)
└── [3-3] 면책조항 + 안내 문구

Phase 4: 변호사 상담 연결
├── [4-1] ContactForm + PrivacyConsent 컴포넌트
├── [4-2] AI 상담 요약 생성 (summarizer.ts)
├── [4-3] /api/consult API + Resend 이메일 발송
├── [4-4] ChatSummary 미리보기 + 완료 페이지
└── [4-5] ConsultCTA 플로팅 버튼 (채팅 화면)

Phase 5: 랜딩 + 마감
├── [5-1] 홈 페이지 (HeroSection, FeatureCards, TrustIndicators)
├── [5-2] 이혼 가이드 페이지 (정보 콘텐츠)
├── [5-3] SEO 메타태그 + OG 이미지
├── [5-4] 모바일 반응형 최종 점검
└── [5-5] Vercel 배포 설정
```

## 10. Key Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@ai-sdk/anthropic": "^1.0.0",
    "ai": "^4.0.0",
    "@supabase/supabase-js": "^2.45.0",
    "@supabase/ssr": "^0.5.0",
    "resend": "^4.0.0",
    "zustand": "^5.0.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.400.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "tailwindcss": "^3.4.0",
    "@types/react": "^19.0.0",
    "@types/node": "^22.0.0"
  }
}
```

## 11. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# AI
ANTHROPIC_API_KEY=sk-ant-...

# Email
RESEND_API_KEY=re_...
LAWYER_EMAIL=lawyer@lawfirm.com

# App
NEXT_PUBLIC_APP_URL=https://lawconnect.vercel.app
```

## 12. Responsive Breakpoints

```
Mobile:  < 768px   → 단일 컬럼, 하단 네비, 풀스크린 채팅
Tablet:  768-1024px → 채팅 영역 확대, 사이드 여백
Desktop: > 1024px   → 최대 너비 제한, 중앙 정렬
```

---

**Created**: 2026-02-12
**Plan Reference**: docs/01-plan/features/lawconnect-ai-chatbot.plan.md
**Feature**: lawconnect-ai-chatbot
**Phase**: Design
**Level**: Dynamic
