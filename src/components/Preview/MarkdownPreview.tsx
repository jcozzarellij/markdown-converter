import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

const remarkPlugins = [remarkGfm];
const rehypePlugins = [rehypeHighlight];
const tableComponents = {
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="md-table-wrapper">
      <table>{children}</table>
    </div>
  ),
};

interface MarkdownPreviewProps {
  content: string;
}

export const MarkdownPreview = memo(function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <div className="h-full overflow-auto bg-surface p-6">
      <div className="markdown-preview">
        <ReactMarkdown
          remarkPlugins={remarkPlugins}
          rehypePlugins={rehypePlugins}
          components={tableComponents}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
});
