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
}
