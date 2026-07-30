import { useState, type FormEvent } from 'react'
import { Search as SearchIcon, FileText } from 'lucide-react'
import { extractErrorMessage, searchDocuments } from '../lib/api'
import type { SearchResultItem } from '../types'
import { Card, EmptyState, Field } from '../components/ui/primitives'
import { Button } from '../components/ui/Button'
import { useToast } from '../contexts/ToastContext'

export function SearchPage() {
  const { notify } = useToast()
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<'semantic' | 'keyword'>('semantic')
  const [uploadedAfter, setUploadedAfter] = useState('')
  const [uploadedBefore, setUploadedBefore] = useState('')
  const [results, setResults] = useState<SearchResultItem[] | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    try {
      const res = await searchDocuments({
        query,
        mode,
        uploaded_after: uploadedAfter || null,
        uploaded_before: uploadedBefore || null,
        top_k: 15,
      })
      setResults(res.results)
    } catch (err) {
      notify(extractErrorMessage(err, 'Search failed.'), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink dark:text-ink-dark">Search</h1>
        <p className="mt-1 font-body text-sm text-ink/60 dark:text-ink-dark/60">
          Browse matching passages directly — no answer is generated here.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your documents…"
            className="flex-1 rounded-md border border-line bg-surface px-3.5 py-2.5 font-body text-sm text-ink placeholder:text-ink/40 focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal dark:border-line-dark dark:bg-surface-dark dark:text-ink-dark dark:placeholder:text-ink-dark/40"
          />
          <Button type="submit" loading={loading} disabled={!query.trim()}>
            <SearchIcon className="h-4 w-4" /> Search
          </Button>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div className="flex overflow-hidden rounded-md border border-line dark:border-line-dark">
            {(['semantic', 'keyword'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wide transition-colors ${
                  mode === m
                    ? 'bg-signal text-white dark:bg-signal-dark dark:text-paper-dark'
                    : 'bg-surface text-ink/60 hover:text-ink dark:bg-surface-dark dark:text-ink-dark/60 dark:hover:text-ink-dark'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <Field
            label="Uploaded after"
            type="date"
            value={uploadedAfter}
            onChange={(e) => setUploadedAfter(e.target.value)}
            className="py-1.5"
          />
          <Field
            label="Uploaded before"
            type="date"
            value={uploadedBefore}
            onChange={(e) => setUploadedBefore(e.target.value)}
            className="py-1.5"
          />
        </div>
      </form>

      {results === null ? (
        <EmptyState
          icon={<SearchIcon className="h-8 w-8" />}
          title="Search across your documents"
          description="Semantic search finds conceptually related passages; keyword search finds exact matches."
        />
      ) : results.length === 0 ? (
        <EmptyState icon={<SearchIcon className="h-8 w-8" />} title="No matches found" description="Try a different query or search mode." />
      ) : (
        <div className="flex flex-col gap-3">
          {results.map((r, i) => (
            <Card key={`${r.document_id}-${r.page}-${i}`} className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-ink/40 dark:text-ink-dark/40" />
                  <span className="font-body text-sm font-medium text-ink dark:text-ink-dark">
                    {r.document_name}
                  </span>
                  <span className="font-mono text-xs text-ink/40 dark:text-ink-dark/40">p.{r.page}</span>
                </div>
                {r.similarity !== null && (
                  <span className="font-mono text-xs text-signal dark:text-signal-dark">
                    {(r.similarity * 100).toFixed(0)}% match
                  </span>
                )}
              </div>
              <p className="mt-2 font-body text-sm text-ink/70 dark:text-ink-dark/70">{r.snippet}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
