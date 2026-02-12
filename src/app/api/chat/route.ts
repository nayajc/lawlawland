import { getSystemPrompt } from '@/lib/ai/prompts';
import type { ChatCategory } from '@/types';

const MOCK_RESPONSES: Record<string, string> = {
  'general': '안녕하세요! LawLawLand AI입니다. 이혼 관련 법률 정보에 대해 안내해 드리겠습니다.\n\n이혼은 크게 **협의이혼**과 **재판이혼**으로 나뉩니다.\n\n- **협의이혼**: 부부 쌍방이 합의하여 가정법원에 이혼 의사 확인을 받는 방식\n- **재판이혼**: 민법 제840조에 정한 사유로 법원에 소를 제기하는 방식\n\n어떤 부분이 더 궁금하신가요?\n\n> 본 정보는 일반적인 법률 정보이며, 개별 사안에 대한 법률 조언이 아닙니다.',
  'divorce-reason': '이혼 사유에 대해 안내드립니다.\n\n**재판이혼의 6가지 법정 사유** (민법 제840조):\n1. 배우자에 부정한 행위가 있었을 때\n2. 배우자가 악의로 다른 일방을 유기한 때\n3. 배우자 또는 그 직계존속으로부터 심히 부당한 대우를 받았을 때\n4. 자기의 직계존속이 배우자로부터 심히 부당한 대우를 받았을 때\n5. 배우자의 생사가 3년 이상 분명하지 아니한 때\n6. 기타 혼인을 계속하기 어려운 중대한 사유가 있을 때\n\n성격 차이는 6호 "기타 중대한 사유"에 해당할 수 있으나, 구체적인 사정에 따라 달라집니다.\n\n> 본 정보는 일반적인 법률 정보이며, 개별 사안에 대한 법률 조언이 아닙니다.',
  'property': '재산분할에 대해 안내드립니다.\n\n**핵심 포인트:**\n- 재산분할청구권은 이혼 성립일로부터 **2년 이내** 행사해야 합니다 (민법 제839조의2)\n- 혼인 중 형성된 재산이 분할 대상이며, 기여도에 따라 배분됩니다\n- **특유재산** (혼인 전 재산, 상속재산)은 원칙적으로 분할 대상 제외\n\n기여도 판단 시 고려 요소:\n- 혼인 기간\n- 재산 형성에 대한 기여\n- 가사노동, 자녀 양육 기여\n\n> 본 정보는 일반적인 법률 정보이며, 개별 사안에 대한 법률 조언이 아닙니다.',
  'custody': '양육권에 대해 안내드립니다.\n\n**양육권 결정 시 최우선 기준: 자녀의 복리**\n\n법원이 고려하는 요소:\n- 자녀의 연령과 의사\n- 양육 환경 (주거, 경제력)\n- 부모의 양육 의지와 능력\n- 자녀와의 친밀도\n\n**양육비**는 서울가정법원 양육비 산정기준표를 참고하며, 부모 쌍방의 소득과 자녀 수/연령에 따라 산정됩니다.\n\n> 본 정보는 일반적인 법률 정보이며, 개별 사안에 대한 법률 조언이 아닙니다.',
  'alimony': '위자료에 대해 안내드립니다.\n\n**위자료란?**\n이혼으로 인한 정신적 손해배상입니다. 재산분할과는 별개의 청구입니다.\n\n**산정 시 고려 요소:**\n- 혼인 기간\n- 과실 정도 (유책 사유)\n- 양측의 재산 상태\n- 정신적 고통의 정도\n\n일반적으로 수백만 원~수천만 원 범위이며, 사안에 따라 크게 다릅니다.\n\n> 본 정보는 일반적인 법률 정보이며, 개별 사안에 대한 법률 조언이 아닙니다.',
};

function getMockResponse(category: ChatCategory, lastMessage: string): string {
  // Check for emergency keywords
  if (/폭력|자해|죽고싶|때려|맞아/.test(lastMessage)) {
    return '걱정이 됩니다. 지금 위험한 상황이시라면 즉시 도움을 요청해주세요.\n\n**긴급 연락처:**\n- 경찰: 112\n- 여성긴급전화: 1366\n- 자살예방상담: 1393\n\n안전이 가장 중요합니다.';
  }
  return MOCK_RESPONSES[category] || MOCK_RESPONSES['general'];
}

export async function POST(req: Request) {
  const { messages, category, sessionId } = (await req.json()) as {
    messages: { role: 'user' | 'assistant'; content: string }[];
    category: ChatCategory;
    sessionId?: string;
  };

  const isMockMode = !process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'sk-ant-your-key';

  if (isMockMode) {
    const lastUserMsg = messages.filter(m => m.role === 'user').pop()?.content || '';
    const mockText = getMockResponse(category, lastUserMsg);

    // Simulate streaming with a readable stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Simulate AI SDK data stream format
        const chunks = mockText.split(/(?<=\n)|(?<=\. )|(?<=다\. )/);
        for (const chunk of chunks) {
          // AI SDK data stream protocol: 0:"text"\n
          controller.enqueue(encoder.encode(`0:${JSON.stringify(chunk)}\n`));
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        // Finish message
        controller.enqueue(encoder.encode(`d:{"finishReason":"stop"}\n`));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Vercel-AI-Data-Stream': 'v1',
      },
    });
  }

  // Real mode with Anthropic API
  const { streamText } = await import('ai');
  const { anthropic } = await import('@ai-sdk/anthropic');
  const { createServerClient } = await import('@/lib/supabase/server');

  const result = streamText({
    model: anthropic('claude-sonnet-4-5-20250929'),
    system: getSystemPrompt(category),
    messages,
    maxTokens: 1024,
    async onFinish({ text }) {
      if (sessionId) {
        try {
          const supabase = createServerClient();
          await supabase
            .from('conversations')
            .upsert(
              {
                session_id: sessionId,
                category,
                messages: JSON.stringify(messages.concat({ role: 'assistant', content: text })),
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'session_id' }
            );
        } catch {
          // Non-blocking
        }
      }
    },
  });

  return result.toDataStreamResponse();
}
