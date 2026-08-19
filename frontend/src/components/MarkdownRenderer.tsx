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
    <div className="relative my-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-900 font-mono text-xs text-slate-100 dark:border-slate-800">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-1.5 text-slate-400">
        <span className="text-[10px] uppercase font-mono tracking-wider">Snippet</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] hover:text-slate-200 transition-colors"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 leading-relaxed">
        <code>{children}</code>
      </pre>
    </div>
  )
}

export function MarkdownRenderer({ content, className = '' }: Props) {
  return (
    <div
      className={`max-w-none font-body text-sm leading-relaxed text-slate-800 dark:text-slate-200 ${className}`}
    >
      <ReactMarkdown
        components={{
          p: ({ children }) => (
            <p className="mb-2.5 last:mb-0 leading-relaxed text-slate-800 dark:text-slate-200">
              {children}
            </p>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-4 border-primary-500 bg-primary-50/40 py-2.5 pl-4 pr-3 font-medium italic text-slate-700 dark:border-primary-400 dark:bg-primary-950/20 dark:text-slate-300 rounded-r-lg">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul className="my-2.5 ml-5 list-disc space-y-1 text-slate-800 dark:text-slate-200">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2.5 ml-5 list-decimal space-y-1 text-slate-800 dark:text-slate-200">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),
          h1: ({ children }) => (
            <h1 className="my-3 font-display text-lg font-bold text-slate-900 dark:text-slate-100">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="my-2.5 font-display text-base font-bold text-slate-900 dark:text-slate-100">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="my-2 font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
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
              <code className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-xs font-medium text-primary-700 dark:bg-slate-800 dark:text-primary-300 border border-slate-200 dark:border-slate-700">
                {children}
              </code>
            )
          },
          pre: ({ children }) => <div>{children}</div>,
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <table className="w-full text-left text-xs border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-100 font-mono uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-[10px] tracking-wider">
              {children}
            </thead>
          ),
          th: ({ children }) => <th className="p-2.5 font-semibold border-b border-slate-200 dark:border-slate-800">{children}</th>,
          td: ({ children }) => <td className="p-2.5 border-b border-slate-100 dark:border-slate-800/60 text-slate-700 dark:text-slate-300">{children}</td>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary-600 underline underline-offset-2 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
            >
              {children}
            </a>
          ),
          hr: () => <hr className="my-4 border-slate-200 dark:border-slate-800" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
