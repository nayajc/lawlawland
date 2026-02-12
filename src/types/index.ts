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
