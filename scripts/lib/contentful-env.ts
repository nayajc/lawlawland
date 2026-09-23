import { createClient, type PlainClientAPI } from 'contentful-management';

export const CASE_CONTENT_TYPE_ID = 'winCase';

export const CASE_CATEGORIES = ['민사', '가사', '보전·집행', '행정', '형사', '기타'] as const;

export async function getClient(): Promise<{ cma: PlainClientAPI; locale: string }> {
  const token = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const environmentId = process.env.CONTENTFUL_ENVIRONMENT || 'master';
  if (!token || !spaceId) {
    throw new Error('CONTENTFUL_MANAGEMENT_TOKEN / CONTENTFUL_SPACE_ID 환경변수가 필요합니다. (.env.local)');
  }
  const cma = createClient(
    { accessToken: token, retryOnError: true, retryLimit: 10 },
    { type: 'plain', defaults: { spaceId, environmentId } },
  );
  const locales = await cma.locale.getMany({});
  const locale = locales.items.find((l) => l.default)?.code ?? 'en-US';
  return { cma, locale };
}
