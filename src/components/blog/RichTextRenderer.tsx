import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, INLINES, MARKS } from '@contentful/rich-text-types';
import type { Document } from '@contentful/rich-text-types';
import Image from 'next/image';

const renderOptions = {
  renderMark: {
    [MARKS.BOLD]: (text: any) => <strong className="font-bold">{text}</strong>,
    [MARKS.ITALIC]: (text: any) => <em className="italic">{text}</em>,
    [MARKS.UNDERLINE]: (text: any) => <u className="underline">{text}</u>,
    [MARKS.CODE]: (text: any) => (
      <code className="bg-gray-100 text-indigo-600 px-2 py-1 rounded text-sm font-mono">
        {text}
      </code>
    ),
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (_node: any, children: any) => (
      <p className="mb-4 leading-relaxed text-gray-700">{children}</p>
    ),
    [BLOCKS.HEADING_1]: (_node: any, children: any) => (
      <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4">{children}</h1>
    ),
    [BLOCKS.HEADING_2]: (_node: any, children: any) => (
      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (_node: any, children: any) => (
      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">{children}</h3>
    ),
    [BLOCKS.HEADING_4]: (_node: any, children: any) => (
      <h4 className="text-lg font-bold text-gray-900 mt-6 mb-3">{children}</h4>
    ),
    [BLOCKS.HEADING_5]: (_node: any, children: any) => (
      <h5 className="text-base font-bold text-gray-900 mt-4 mb-2">{children}</h5>
    ),
    [BLOCKS.HEADING_6]: (_node: any, children: any) => (
      <h6 className="text-sm font-bold text-gray-900 mt-4 mb-2">{children}</h6>
    ),
    [BLOCKS.UL_LIST]: (_node: any, children: any) => (
      <ul className="list-disc list-outside mb-4 space-y-1 pl-5">{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (_node: any, children: any) => (
      <ol className="list-decimal list-outside mb-4 space-y-1 pl-5">{children}</ol>
    ),
    [BLOCKS.LIST_ITEM]: (_node: any, children: any) => (
      <li className="text-gray-700 [&>p]:mb-0 [&>p]:mt-0">{children}</li>
    ),
    [BLOCKS.QUOTE]: (_node: any, children: any) => (
      <blockquote className="border-l-4 border-indigo-500 pl-4 italic text-gray-600 my-6">
        {children}
      </blockquote>
    ),
    [BLOCKS.HR]: () => <hr className="my-8 border-gray-300" />,
    [BLOCKS.EMBEDDED_ASSET]: (node: any) => {
      const { file, title, description } = node.data.target.fields;
      const imageUrl = `https:${file.url}`;

      return (
        <div className="my-8">
          <div className="relative w-full h-96 rounded-lg overflow-hidden">
            <Image
              src={imageUrl}
              alt={description || title || 'Blog image'}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
          {description && (
            <p className="text-sm text-gray-500 text-center mt-2">{description}</p>
          )}
        </div>
      );
    },
    [INLINES.HYPERLINK]: (node: any, children: any) => (
      <a
        href={node.data.uri}
        target="_blank"
        rel="noopener noreferrer"
        className="text-indigo-600 hover:text-indigo-700 underline"
      >
        {children}
      </a>
    ),
  },
};

interface RichTextRendererProps {
  content: Document;
}

export function RichTextRenderer({ content }: RichTextRendererProps) {
  return <div className="prose max-w-none">{documentToReactComponents(content, renderOptions)}</div>;
}
