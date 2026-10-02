import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

export const POSTS_DIR = path.join(__dirname, 'posts');
export const IMAGES_DIR = path.join(__dirname, '..', '.blog-images');
export const BLOG_CONTENT_TYPE_ID = 'blogPost';

export interface PostSource {
  file: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string;
  publishedAt: string;
  imageAlt: string;
  imagePrompt: string;
  body: string;
}

export function loadPosts(): PostSource[] {
  return readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((file) => {
      const raw = readFileSync(path.join(POSTS_DIR, file), 'utf8');
      const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      if (!m) throw new Error(`${file}: frontmatter 형식이 올바르지 않습니다.`);
      const meta: Record<string, string> = {};
      for (const line of m[1].split('\n')) {
        const i = line.indexOf(':');
        if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
      }
      for (const k of ['slug', 'title', 'excerpt', 'category', 'tags', 'publishedAt', 'imageAlt', 'imagePrompt']) {
        if (!meta[k]) throw new Error(`${file}: frontmatter "${k}" 누락`);
      }
      return { file, body: m[2].trim(), ...(meta as Omit<PostSource, 'file' | 'body'>) };
    });
}

// ---------- Markdown 일부 문법 → Contentful Rich Text ----------

type Node = Record<string, unknown>;

const text = (value: string, bold = false): Node => ({
  nodeType: 'text',
  value,
  marks: bold ? [{ type: 'bold' }] : [],
  data: {},
});

function inline(src: string): Node[] {
  const out: Node[] = [];
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    if (m.index > last) out.push(text(src.slice(last, m.index)));
    if (m[1] !== undefined) {
      out.push(text(m[1], true));
    } else {
      const uri = m[3].startsWith('/') ? `https://ohsoojin.com${m[3]}` : m[3];
      out.push({ nodeType: 'hyperlink', data: { uri }, content: [text(m[2])] });
    }
    last = m.index + m[0].length;
  }
  if (last < src.length) out.push(text(src.slice(last)));
  return out;
}

const paragraph = (src: string): Node => ({ nodeType: 'paragraph', data: {}, content: inline(src) });
const listItem = (src: string): Node => ({ nodeType: 'list-item', data: {}, content: [paragraph(src)] });

export function markdownToRichText(md: string): Node {
  const content: Node[] = [];
  const lines = md.split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    let m: RegExpMatchArray | null;
    if ((m = line.match(/^(#{2,3}) (.+)$/))) {
      content.push({ nodeType: `heading-${m[1].length}`, data: {}, content: inline(m[2]) });
      i++;
    } else if (/^---+$/.test(line.trim())) {
      content.push({ nodeType: 'hr', data: {}, content: [] });
      i++;
    } else if (line.startsWith('> ')) {
      const parts: string[] = [];
      while (i < lines.length && lines[i].startsWith('> ')) parts.push(lines[i++].slice(2));
      content.push({ nodeType: 'blockquote', data: {}, content: [paragraph(parts.join(' '))] });
    } else if (/^- /.test(line)) {
      const items: Node[] = [];
      while (i < lines.length && /^- /.test(lines[i])) items.push(listItem(lines[i++].slice(2)));
      content.push({ nodeType: 'unordered-list', data: {}, content: items });
    } else if (/^\d+\. /.test(line)) {
      const items: Node[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) items.push(listItem(lines[i++].replace(/^\d+\. /, '')));
      content.push({ nodeType: 'ordered-list', data: {}, content: items });
    } else {
      const parts: string[] = [];
      while (i < lines.length && lines[i].trim() && !/^(#{2,3} |- |\d+\. |> |---)/.test(lines[i])) parts.push(lines[i++]);
      content.push(paragraph(parts.join(' ')));
    }
  }
  return { nodeType: 'document', data: {}, content };
}
