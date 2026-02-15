import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownViewProps {
  content: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content }) => {
  return (
    <div className="prose prose-sm md:prose-base prose-emerald max-w-none dark:prose-invert">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          // Override simple text components for specific styling if needed
          p: ({node, ...props}) => <p className="mb-2 leading-relaxed text-gray-800" {...props} />,
          h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-4 mb-2 text-emerald-800" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-3 mb-2 text-emerald-700" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-md font-bold mt-2 mb-1 text-emerald-600" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
          li: ({node, ...props}) => <li className="text-gray-700" {...props} />,
          code: ({node, inline, className, children, ...props}: any) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline ? (
              <div className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto my-2 text-sm font-mono shadow-inner">
                <code className={className} {...props}>
                  {children}
                </code>
              </div>
            ) : (
              <code className="bg-gray-100 text-emerald-600 px-1 py-0.5 rounded font-mono text-sm border border-gray-200" {...props}>
                {children}
              </code>
            );
          },
          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-emerald-500 pl-4 italic text-gray-600 my-2" {...props} />,
          table: ({node, ...props}) => <div className="overflow-x-auto my-3 border rounded-lg"><table className="min-w-full divide-y divide-gray-200" {...props} /></div>,
          th: ({node, ...props}) => <th className="px-3 py-2 bg-emerald-50 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider" {...props} />,
          td: ({node, ...props}) => <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 border-t border-gray-100" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
