export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  category?: string;
  timestamp: string;
}

export interface ConsultationRequest {
  conversationId: string | null;
  name: string;
  phone: string;
  email?: string;
  preferredTime?: string;
  privacyAgreed: boolean;
  summary: string;
}

export interface Lawyer {
  id: string;
  name: string;
  email: string;
  specialty: string[];
  is_active: boolean;
}

export interface Conversation {
  id: string;
  session_id: string;
  category: string;
  messages: ChatMessage[];
  summary: string | null;
  created_at: string;
  updated_at: string;
}

export type ChatCategory =
  | 'general'
  | 'divorce-reason'
  | 'property'
  | 'alimony'
  | 'custody'
  | 'parental-authority'
  | 'name-change'
  | 'procedure';

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: any; // Rich text from Contentful
  coverImage?: {
    url: string;
    title: string;
    description?: string;
  };
  author: string;
  publishedAt: string;
  category?: string;
  tags?: string[];
}

export interface BlogPostListItem {
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: {
    url: string;
    title: string;
  };
  author: string;
  publishedAt: string;
  category?: string;
  tags?: string[];
}

export type WinCaseCategory = '민사' | '가사' | '보전·집행' | '행정' | '형사' | '기타';

export interface WinCaseImage {
  url: string;
  width: number;
  height: number;
  title: string;
  description?: string;
}

export interface WinCaseListItem {
  slug: string;
  caseNumber: number;
  title: string;
  category: WinCaseCategory;
  originalTag?: string;
  publishedAt: string;
  imageCount: number;
  summary?: string;
}

export interface WinCase extends WinCaseListItem {
  images: WinCaseImage[];
  sourceUrl?: string;
  /** [사건][쟁점][결과][의의] 구조의 상세 텍스트 (원문) */
  caseDetail?: string;
}
