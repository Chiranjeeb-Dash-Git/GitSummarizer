import { memo, useDeferredValue } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import CodeBlock from './CodeBlock.jsx';

// Marks every top-level node with the index of the h2 section it belongs to (1 to 6, cycling).
function rehypeSections() {
  return (tree) => {
    let section = 0;
    for (const node of tree.children) {
      if (node.type !== 'element') continue;
      if (node.tagName === 'h2') section += 1;
      if (section > 0) node.properties = { ...node.properties, dataSec: ((section - 1) % 6) + 1 };
    }
  };
}

const components = {
  pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
  a: ({ href, children }) => {
    const external = /^https?:\/\//i.test(href ?? '');
    return (
      <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {children}
      </a>
    );
  },
};

function MarkdownBase({ source, streaming }) {
  const deferred = useDeferredValue(source);
  return (
    <div className="md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, rehypeSections, [rehypeHighlight, { detect: false, ignoreMissing: true }]]}
        components={components}
      >
        {deferred}
      </ReactMarkdown>
      {streaming && <span className="caret" aria-hidden="true" />}
    </div>
  );
}

export default memo(MarkdownBase);

