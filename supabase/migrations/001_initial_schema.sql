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

-- RLS
ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE lawyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON conversations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow session-based select" ON conversations
  FOR SELECT USING (true);

CREATE POLICY "Allow session-based update" ON conversations
  FOR UPDATE USING (true);
