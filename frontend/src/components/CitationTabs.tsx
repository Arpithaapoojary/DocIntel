import { FileText, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import type { SourceOut } from '../types'
import { useToast } from '../contexts/ToastContext'

export function CitationTabs({ sources }: { sources: SourceOut[] }) {
  const { notify } = useToast()
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  if (!sources || sources.length === 0) return null

  function handleCopySnippet(snippet: string, idx: number, e: React.MouseEvent) {
    e.stopPropagation()
    navigator.clipboard.writeText(snippet)
    setCopiedIndex(idx)
    notify('Citation copied to clipboard.')
    setTimeout(() => setCopiedIndex(null), 1800)
  }

  return (
    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Sources ({sources.length})
        </span>
        <span className="font-sans text-[11px] text-slate-400 dark:text-slate-500">
          Click passage to expand
        </span>
      </div>

      <div className="space-y-1.5">
        {sources.map((s, i) => {
          const isExpanded = expandedIndex === i
          return (
            <div
              key={`${s.document_id}-${s.page}-${i}`}
              onClick={() => setExpandedIndex(isExpanded ? null : i)}
              className={`rounded-lg border text-left transition-colors cursor-pointer ${
                isExpanded
                  ? 'border-brand-300 bg-brand-50/40 dark:border-brand-800 dark:bg-brand-950/20'
                  : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/70 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:bg-slate-900'
              }`}
            >
              {/* Header row */}
              <div className="flex items-center justify-between p-2 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
                  <span className="truncate font-sans text-xs font-medium text-slate-800 dark:text-slate-200">
                    {s.document_name}
                  </span>
                  <span className="shrink-0 rounded bg-slate-200/80 px-1.5 py-0.2 font-mono text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    p. {s.page}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => handleCopySnippet(s.snippet, i, e)}
                    title="Copy passage snippet"
                    className="flex h-5 w-5 items-center justify-center rounded text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                  >
                    {copiedIndex === i ? (
                      <Check className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                  <div className="text-slate-400">
                    {isExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expandable Passage Snippet */}
              {isExpanded && (
                <div className="px-2.5 pb-2.5 pt-0.5">
                  <div className="rounded border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
                    <p className="font-sans text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      "{s.snippet}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
