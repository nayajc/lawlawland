/**
 * 블로그 본문(Contentful Rich Text)에서 "자주 묻는 질문" 섹션을 추출해 FAQPage JSON-LD로 쓴다.
 * 구조: heading-2 "자주 묻는 질문" 아래 heading-3 = 질문, 이어지는 paragraph = 답변.
 */

interface RtNode {
  nodeType: string;
  value?: string;
  content?: RtNode[];
}

const plain = (n: RtNode): string =>
  n.value ?? (n.content ?? []).map(plain).join('');

export function extractFaq(doc: { content?: RtNode[] } | null | undefined): { question: string; answer: string }[] {
  const nodes = doc?.content ?? [];
  const start = nodes.findIndex((n) => n.nodeType === 'heading-2' && plain(n).includes('자주 묻는 질문'));
  if (start < 0) return [];

  const faq: { question: string; answer: string }[] = [];
  let current: { question: string; answer: string[] } | null = null;
  const flush = () => {
    if (current && current.answer.length > 0) faq.push({ question: current.question, answer: current.answer.join(' ') });
    current = null;
  };

  for (const n of nodes.slice(start + 1)) {
    if (n.nodeType === 'heading-2') break;
    if (n.nodeType === 'heading-3') {
      flush();
      current = { question: plain(n).trim(), answer: [] };
    } else if (current && (n.nodeType === 'paragraph' || n.nodeType.endsWith('-list'))) {
      current.answer.push(plain(n).trim());
    }
  }
  flush();
  return faq;
}
