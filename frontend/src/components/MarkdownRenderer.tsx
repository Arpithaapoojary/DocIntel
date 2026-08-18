import ReactMarkdown from 'react-markdown'

interface Props {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = '' }: Props) {
  return (
    <div
      className={`max-w-none text-ink dark:text-ink-dark font-body text-sm ${className}`}
    >
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
          blockquote: ({ children }) => (
            <blockquote className="my-2 border-l-3 border-signal pl-3 italic text-ink/85 dark:border-signal-dark dark:text-ink-dark/85 bg-paper/60 dark:bg-paper-dark/60 py-2 pr-3 rounded-r border-y border-r border-line/40 dark:border-line-dark/40">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => <ul className="my-2 ml-4 list-disc space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="my-2 ml-4 list-decimal space-y-1">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          h1: ({ children }) => <h1 className="text-lg font-bold text-ink dark:text-ink-dark my-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-bold text-ink dark:text-ink-dark my-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-semibold text-ink dark:text-ink-dark my-1.5">{children}</h3>,
          strong: ({ children }) => <strong className="font-semibold text-ink dark:text-ink-dark">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          code: ({ children }) => (
            <code className="rounded bg-paper px-1.5 py-0.5 font-mono text-xs text-signal dark:bg-paper-dark dark:text-signal-dark border border-line dark:border-line-dark">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="my-2 overflow-x-auto rounded-md bg-paper p-3 font-mono text-xs text-ink dark:bg-paper-dark dark:text-ink-dark border border-line dark:border-line-dark">
              {children}
            </pre>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
