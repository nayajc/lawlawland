import { unstable_cache } from 'next/cache';
import { contentfulClient } from './client';
import type { WinCase, WinCaseCategory, WinCaseImage, WinCaseListItem } from '@/types';

const CONTENT_TYPE = 'winCase';

export const WIN_CASE_CATEGORIES: WinCaseCategory[] = ['가사', '민사', '보전·집행', '행정', '형사', '기타'];

export function isWinCaseCategory(value: string | undefined): value is WinCaseCategory {
  return !!value && (WIN_CASE_CATEGORIES as string[]).includes(value);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapListItem(entry: any): WinCaseListItem {
  const f = entry.fields;
  return {
    slug: f.slug,
    caseNumber: Number(f.caseNumber),
    title: f.title,
    category: isWinCaseCategory(f.category) ? f.category : '기타',
    originalTag: f.originalTag || undefined,
    publishedAt: f.publishedAt,
    imageCount: Array.isArray(f.images) ? f.images.length : 0,
    summary: f.summary || undefined,
  };
}

function mapImage(asset: any): WinCaseImage | null {
  const file = asset?.fields?.file;
  if (!file?.url) return null;
  return {
    url: `https:${file.url}`,
    width: file.details?.image?.width ?? 1200,
    height: file.details?.image?.height ?? 1600,
    title: asset.fields.title ?? '',
    description: asset.fields.description || undefined,
  };
}

function mapCase(entry: any): WinCase {
  const f = entry.fields;
  const images = (Array.isArray(f.images) ? f.images : [])
    .map(mapImage)
    .filter((img: WinCaseImage | null): img is WinCaseImage => img !== null);
  return {
    ...mapListItem(entry),
    imageCount: images.length,
    images,
    sourceUrl: f.sourceUrl || undefined,
    caseDetail: f.caseDetail || undefined,
  };
}

export type CaseDetailSection = { label: '사건' | '쟁점' | '결과' | '의의' | '내용'; text: string };

/** "[사건] ... [쟁점] ... " 형태의 텍스트를 항목별로 분리. 라벨이 없으면 통째로 '내용' 하나. */
export function parseCaseDetail(raw: string | undefined): CaseDetailSection[] {
  if (!raw) return [];
  const re = /\[(사건|쟁점|결과|의의)\]\s*/g;
  const out: CaseDetailSection[] = [];
  let m: RegExpExecArray | null;
  let last: { label: CaseDetailSection['label']; start: number } | null = null;
  while ((m = re.exec(raw))) {
    if (last) out.push({ label: last.label, text: raw.slice(last.start, m.index).trim() });
    last = { label: m[1] as CaseDetailSection['label'], start: m.index + m[0].length };
  }
  if (last) out.push({ label: last.label, text: raw.slice(last.start).trim() });
  else out.push({ label: '내용', text: raw.trim() });
  return out.filter((s) => s.text);
}
/* eslint-enable @typescript-eslint/no-explicit-any */

async function fetchAllWinCases(): Promise<WinCaseListItem[]> {
  if (!contentfulClient) return [];
  try {
    const items: WinCaseListItem[] = [];
    for (let skip = 0; ; skip += 1000) {
      const res = await contentfulClient.getEntries({
        content_type: CONTENT_TYPE,
        order: ['-fields.caseNumber'],
        limit: 1000,
        skip,
        include: 0,
        select: ['fields.slug', 'fields.caseNumber', 'fields.title', 'fields.category', 'fields.originalTag', 'fields.publishedAt', 'fields.images', 'fields.summary'],
      } as never);
      items.push(...res.items.map(mapListItem));
      if (res.items.length < 1000) break;
    }
    return items;
  } catch (error) {
    console.error('Failed to fetch win cases:', error);
    return [];
  }
}

/** 전체 목록. 서버 캐시 1시간 (방문마다 Contentful API를 호출하지 않도록). */
export const getAllWinCases = unstable_cache(fetchAllWinCases, ['win-cases-all'], {
  revalidate: 3600,
  tags: ['win-cases'],
});

export async function getWinCaseBySlug(slug: string): Promise<WinCase | null> {
  if (!contentfulClient) return null;
  try {
    const res = await contentfulClient.getEntries({
      content_type: CONTENT_TYPE,
      'fields.slug': slug,
      include: 1,
      limit: 1,
    } as never);
    if (res.items.length === 0) return null;
    return mapCase(res.items[0]);
  } catch (error) {
    console.error(`Failed to fetch win case "${slug}":`, error);
    return null;
  }
}

export async function getAllWinCaseSlugs(): Promise<string[]> {
  const cases = await getAllWinCases();
  return cases.map((c) => c.slug);
}

/** 상세 페이지 하단 이전/다음 사례 */
export async function getAdjacentWinCases(caseNumber: number): Promise<{ prev: WinCaseListItem | null; next: WinCaseListItem | null }> {
  const all = await getAllWinCases(); // 번호 내림차순
  const idx = all.findIndex((c) => c.caseNumber === caseNumber);
  if (idx === -1) return { prev: null, next: null };
  return {
    next: idx > 0 ? all[idx - 1] : null, // 더 최신
    prev: idx < all.length - 1 ? all[idx + 1] : null, // 더 예전
  };
}
