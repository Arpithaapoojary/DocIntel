import ReactMarkdown from 'react-markdown'
import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

interface Props {
  content: string
  className?: string
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false)
  const codeString = String(children).replace(/\n$/, '')

  function handleCopy() {
    navigator.clipboard.writeText(codeString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative my-2.5 overflow-hidden rounded-lg border border-slate-800 bg-slate-950 font-mono text-xs text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-3 py-1.5 text-slate-400">
        <span className="text-[10px] uppercase font-mono tracking-wider">Snippet</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="overflow-x-auto p-3 leading-relaxed">
        <code>{children}</code>
      </pre>
    </div>
  )
}

export function MarkdownRenderer({ content, className = '' }: Props) {
  return (
    <div
      className={`max-w-none font-sans text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200 ${className}`}
    >
      <ReactMarkdown
        components={{
          p: ({ children }) => (
            <p className="mb-2 last:mb-0 leading-relaxed text-slate-800 dark:text-slate-200">
              {children}
            </p>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-2 border-l-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 py-1.5 pl-3 pr-2 text-slate-600 dark:text-slate-400">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul className="my-2 ml-4 list-disc space-y-0.5 text-slate-800 dark:text-slate-200">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2 ml-4 list-decimal space-y-0.5 text-slate-800 dark:text-slate-200">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),
          h1: ({ children }) => (
            <h1 className="my-2.5 font-display text-base font-bold text-slate-900 dark:text-slate-100">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="my-2 font-display text-sm font-bold text-slate-900 dark:text-slate-100">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="my-1.5 font-display text-xs font-semibold text-slate-900 dark:text-slate-100">
              {children}
            </h3>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-900 dark:text-slate-100">
              {children}
            </strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          code: ({ children }) => {
            const isMultiLine = String(children).includes('\n')
            if (isMultiLine) {
              return <CodeBlock>{children}</CodeBlock>
            }
            return (
              <code className="rounded bg-slate-100 px-1 py-0.2 font-mono text-[11px] text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                {children}
              </code>
            )
          },
          pre: ({ children }) => <div>{children}</div>,
          table: ({ children }) => (
            <div className="my-2.5 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-50 font-mono uppercase text-slate-500 dark:bg-slate-900 dark:text-slate-400 text-[10px] tracking-wider">
              {children}
            </thead>
          ),
          th: ({ children }) => <th className="p-2 font-semibold border-b border-slate-200 dark:border-slate-800">{children}</th>,
          td: ({ children }) => <td className="p-2 border-b border-slate-100 dark:border-slate-800/60 text-slate-700 dark:text-slate-300">{children}</td>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
            >
              {children}
            </a>
          ),
          hr: () => <hr className="my-3 border-slate-200 dark:border-slate-800" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
