/** 검색 결과(네이버·구글) 스니펫에 맞춘 텍스트 길이 유틸 */

export const SITE_URL = 'https://ohsoojin.com';
export const SITE_NAME = '오수진 변호사';
export const DEFAULT_OG_IMAGE = { url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: '이혼전문변호사 오수진' };

/** 최대 길이로 자르되 단어(공백) 경계에서 끊고 말줄임표를 붙인다. */
export function truncateTitle(text: string, max = 40): string {
  const t = text.trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[,\s·]+$/, '') + '…';
}

/**
 * 설명문: 첫 문장이 max 이내면 첫 문장, 아니면 max에서 단어 경계로 자른다.
 * 네이버 모바일은 약 80자, 구글은 약 150자를 노출하므로 기본 110자.
 */
export function snippetDescription(text: string | undefined, fallback: string, max = 110): string {
  const t = (text ?? '').replace(/\s+/g, ' ').trim();
  if (!t) return fallback;
  const firstSentence = t.match(/^.+?[.!?。](?=\s|$)/)?.[0];
  if (firstSentence && firstSentence.length >= 40 && firstSentence.length <= max) return firstSentence;
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[,\s·]+$/, '') + '…';
}
