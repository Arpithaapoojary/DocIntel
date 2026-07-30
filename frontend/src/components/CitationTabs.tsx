import { FileText } from 'lucide-react'
import type { SourceOut } from '../types'

/**
 * Renders sources as "index tabs" — styled after library card-catalog tabs,
 * reinforcing that every answer is traceable to a specific document and page.
 * This is the app's signature visual element (see index.css .citation-tab).
 */
export function CitationTabs({ sources }: { sources: SourceOut[] }) {
  if (sources.length === 0) return null

  return (
    <div className="mt-3 flex flex-col gap-2">
      <p className="font-mono text-[11px] uppercase tracking-wide text-ink/40 dark:text-ink-dark/40">
        Sources
      </p>
      <div className="flex flex-col gap-2">
        {sources.map((s, i) => (
          <div key={`${s.document_id}-${s.page}-${i}`} className="citation-tab flex-col items-start gap-0.5">
            <div className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 shrink-0" />
              <span className="font-medium">{s.document_name}</span>
              <span className="text-signal/60 dark:text-signal-dark/60">· p.{s.page}</span>
            </div>
            <p className="pl-5 text-ink/60 normal-case dark:text-ink-dark/60">{s.snippet}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
