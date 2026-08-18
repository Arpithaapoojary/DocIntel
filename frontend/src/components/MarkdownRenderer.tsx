import ReactMarkdown from 'react-markdown'

interface Props {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = '' }: Props) {
  return (
    <div
      className={`max-w-none text-ink dark:text-ink-dark font-body text-sm ${className}`}
      style={{ color: 'inherit' }}
    >
      <ReactMarkdown
        components={{
          p: ({ children }) => (
            <p className="mb-2 last:mb-0 leading-relaxed text-ink dark:text-ink-dark">
              {children}
            </p>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-4 border-primary/60 pl-4 italic text-ink/80 dark:border-primary-300/60 dark:text-ink-dark/80 bg-primary/5 dark:bg-primary/10 py-2.5 pr-4 rounded-r-lg">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => <ul className="my-2 ml-5 list-disc space-y-1 text-ink dark:text-ink-dark">{children}</ul>,
          ol: ({ children }) => <ol className="my-2 ml-5 list-decimal space-y-1 text-ink dark:text-ink-dark">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed text-ink dark:text-ink-dark">{children}</li>,
          h1: ({ children }) => <h1 className="text-lg font-bold text-ink dark:text-ink-dark my-3">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-bold text-ink dark:text-ink-dark my-2.5">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-semibold text-ink dark:text-ink-dark my-2">{children}</h3>,
          strong: ({ children }) => (
            <strong className="font-semibold text-ink dark:text-ink-dark">{children}</strong>
          ),
          em: ({ children }) => <em className="italic text-ink/90 dark:text-ink-dark/90">{children}</em>,
          code: ({ children }) => (
            <code className="rounded-md bg-primary/8 px-1.5 py-0.5 font-mono text-xs text-primary dark:bg-primary/15 dark:text-primary-300 border border-primary/15 dark:border-primary/25">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="my-3 overflow-x-auto rounded-xl bg-ink/5 p-4 font-mono text-xs text-ink dark:bg-white/5 dark:text-ink-dark border border-line dark:border-line-dark">
              {children}
            </pre>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2 hover:text-primary-600 dark:text-primary-300 dark:hover:text-primary-200 transition-colors"
            >
              {children}
            </a>
          ),
          hr: () => <hr className="my-4 border-line dark:border-line-dark" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
