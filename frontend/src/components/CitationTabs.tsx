import { FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import type { SourceOut } from '../types'

/**
 * Renders sources as citation chips — styled after library card-catalog index
 * tabs. Each chip is expandable to reveal the snippet. This is the app's
 * signature visual element (see index.css .citation-tab).
 */
export function CitationTabs({ sources }: { sources: SourceOut[] }) {
  const [expanded, setExpanded] = useState<number | null>(null)

  if (sources.length === 0) return null

  return (
    <div className="mt-3.5 flex flex-col gap-2">
      <p className="font-mono text-[10px] uppercase tracking-widest text-ink/35 dark:text-ink-dark/35">
        Sources · {sources.length}
      </p>
      <div className="flex flex-col gap-1.5">
        {sources.map((s, i) => (
          <div
            key={`${s.document_id}-${s.page}-${i}`}
            className="citation-tab flex-col items-start gap-0 cursor-pointer transition-all duration-200 hover:bg-primary/12 dark:hover:bg-primary/18"
            onClick={() => setExpanded(expanded === i ? null : i)}
          >
            <div className="flex w-full items-center gap-1.5">
              <FileText className="h-3 w-3 shrink-0" />
              <span className="font-medium truncate flex-1">{s.document_name}</span>
              <span className="text-primary/50 dark:text-primary-300/50 shrink-0">p.{s.page}</span>
              {expanded === i
                ? <ChevronUp className="h-3 w-3 shrink-0 text-primary/40" />
                : <ChevronDown className="h-3 w-3 shrink-0 text-primary/40" />
              }
            </div>
            {expanded === i && (
              <p className="mt-1.5 pl-4 text-ink/55 normal-case leading-relaxed dark:text-ink-dark/55 animate-fade-in">
                {s.snippet}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
