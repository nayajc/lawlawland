/**
 * Contentful에 승소사례(winCase) 콘텐츠 타입을 생성/갱신하고 publish 합니다.
 *
 *   node --env-file=.env.local node_modules/.bin/tsx scripts/setup-case-content-type.ts
 */
import { CASE_CATEGORIES, CASE_CONTENT_TYPE_ID, getClient } from './lib/contentful-env';

const fields = [
  { id: 'caseNumber', name: '사례 번호', type: 'Integer', required: true, validations: [{ unique: true }] },
  { id: 'title', name: '제목', type: 'Symbol', required: true, validations: [{ size: { max: 256 } }] },
  { id: 'slug', name: 'Slug (URL)', type: 'Symbol', required: true, validations: [{ unique: true }, { regexp: { pattern: '^[a-z0-9-]+$' } }] },
  { id: 'category', name: '대분류', type: 'Symbol', required: true, validations: [{ in: [...CASE_CATEGORIES] }] },
  { id: 'originalTag', name: '세부 분류 태그', type: 'Symbol', required: false },
  { id: 'publishedAt', name: '등록일', type: 'Date', required: true },
  { id: 'summary', name: '사건 요약 (검색 노출용 본문)', type: 'Text', required: false },
  {
    id: 'images',
    name: '판결문 이미지',
    type: 'Array',
    required: false,
    items: { type: 'Link', linkType: 'Asset', validations: [{ linkMimetypeGroup: ['image'] }] },
  },
  { id: 'sourceUrl', name: '원본 게시글 URL', type: 'Symbol', required: false },
] as const;

async function main() {
  const { cma } = await getClient();
  const id = { contentTypeId: CASE_CONTENT_TYPE_ID };
  const body = {
    name: '승소사례',
    description: '오수진 변호사 주요 승소사례. 판결문 이미지와 사건 요약.',
    displayField: 'title',
    fields: fields as any,
  };

  let ct;
  try {
    const existing = await cma.contentType.get(id);
    console.log(`기존 콘텐츠 타입 ${CASE_CONTENT_TYPE_ID} 발견, 필드를 갱신합니다.`);
    ct = await cma.contentType.update(id, { ...existing, ...body });
  } catch (e: any) {
    if (e?.name !== 'NotFound' && !String(e?.message).includes('NotFound')) throw e;
    console.log(`콘텐츠 타입 ${CASE_CONTENT_TYPE_ID} 생성`);
    ct = await cma.contentType.createWithId(id, body);
  }
  ct = await cma.contentType.publish(id, ct);
  console.log(`완료: ${ct.sys.id} v${ct.sys.version} (${ct.fields.length} fields)`);

  // 편집 화면 UI: 요약은 여러 줄 텍스트, 분류는 드롭다운, slug는 제목 연동
  const editor = await cma.editorInterface.get(id);
  editor.controls = editor.controls?.map((c) => {
    if (c.fieldId === 'summary') return { ...c, widgetId: 'multipleLine', widgetNamespace: 'builtin' as const };
    if (c.fieldId === 'category') return { ...c, widgetId: 'dropdown', widgetNamespace: 'builtin' as const };
    if (c.fieldId === 'slug') return { ...c, widgetId: 'slugEditor', widgetNamespace: 'builtin' as const, settings: { trackingFieldId: 'title' } };
    return c;
  });
  await cma.editorInterface.update(id, editor);
  console.log('편집 화면 설정 완료');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
