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
    notify('Citation passage copied.')
    setTimeout(() => setCopiedIndex(null), 1800)
  }

  return (
    <div className="mt-4 pt-3.5 border-t border-slate-200/80 dark:border-slate-800/80">
      <div className="flex items-center justify-between mb-2.5">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Referenced Sources ({sources.length})
        </span>
        <span className="font-body text-[11px] text-slate-400 dark:text-slate-500">
          Click passage to expand
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {sources.map((s, i) => {
          const isExpanded = expandedIndex === i
          return (
            <div
              key={`${s.document_id}-${s.page}-${i}`}
              onClick={() => setExpandedIndex(isExpanded ? null : i)}
              className={`rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                isExpanded
                  ? 'border-primary/40 bg-primary-50/40 shadow-xs dark:border-primary/50 dark:bg-primary-950/25'
                  : 'border-slate-200/90 bg-slate-50/70 hover:border-slate-300 hover:bg-slate-100/80 dark:border-slate-800/90 dark:bg-slate-900/60 dark:hover:border-slate-700 dark:hover:bg-slate-800/60'
              }`}
            >
              {/* Header row */}
              <div className="flex items-center justify-between p-2.5 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                    <FileText className="h-3 w-3" />
                  </div>
                  <span className="truncate font-body text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {s.document_name}
                  </span>
                  <span className="shrink-0 rounded-md bg-slate-200/70 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    Page {s.page}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={(e) => handleCopySnippet(s.snippet, i, e)}
                    title="Copy passage snippet"
                    className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-white hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
                  >
                    {copiedIndex === i ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                  <div className="text-slate-400 dark:text-slate-500">
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
                <div className="px-3 pb-3 pt-1 animate-fade-in">
                  <div className="rounded-lg border border-slate-200/70 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
                    <p className="font-body text-xs leading-relaxed text-slate-600 dark:text-slate-300 italic">
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
