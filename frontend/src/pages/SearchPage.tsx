import { useState, type FormEvent } from 'react'
import { Search as SearchIcon, FileText, Sparkles, Hash } from 'lucide-react'
import { extractErrorMessage, searchDocuments } from '../lib/api'
import type { SearchResultItem } from '../types'
import { EmptyState, Field } from '../components/ui/primitives'
import { Button } from '../components/ui/Button'
import { useToast } from '../contexts/ToastContext'

export function SearchPage() {
  const { notify }  = useToast()
  const [query, setQuery]   = useState('')
  const [mode, setMode]     = useState<'semantic' | 'keyword'>('semantic')
  const [uploadedAfter,  setUploadedAfter]  = useState('')
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
        uploaded_after:  uploadedAfter  || null,
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
      {/* ── Header ── */}
      <div className="animate-fade-in-up">
        <h1 className="font-display text-3xl font-bold text-ink dark:text-ink-dark tracking-tight">
          Search
        </h1>
        <p className="mt-1 font-body text-sm text-ink/55 dark:text-ink-dark/55">
          Browse matching passages directly — no answer is generated here.
        </p>
      </div>

      {/* ── Search form ── */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-fade-in-up" style={{ animationDelay: '80ms' }}>
        {/* Search input */}
        <div className="relative flex items-center gap-3 rounded-2xl border border-line/60 bg-surface px-4 py-3 shadow-card transition-all duration-200 focus-within:border-primary/50 focus-within:shadow-glow-sm dark:border-line-dark dark:bg-surface-dark">
          <SearchIcon className="h-4 w-4 shrink-0 text-ink/35 dark:text-ink-dark/35" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your documents…"
            className="flex-1 bg-transparent font-body text-sm text-ink placeholder:text-ink/35 focus:outline-none dark:text-ink-dark dark:placeholder:text-ink-dark/35"
          />
          <Button type="submit" size="sm" loading={loading} disabled={!query.trim()}>
            Search
          </Button>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap items-end gap-4">
          {/* Mode toggle */}
          <div>
            <p className="mb-1.5 font-body text-xs font-medium text-ink/55 dark:text-ink-dark/55">Mode</p>
            <div className="flex overflow-hidden rounded-xl border border-line/60 dark:border-line-dark shadow-sm">
              {(['semantic', 'keyword'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`flex items-center gap-1.5 px-4 py-2 font-body text-xs font-medium transition-all duration-200 ${
                    mode === m
                      ? 'bg-gradient-to-r from-primary to-primary-600 text-white'
                      : 'bg-surface text-ink/55 hover:bg-primary/5 hover:text-primary dark:bg-surface-dark dark:text-ink-dark/55 dark:hover:bg-primary/8 dark:hover:text-primary-300'
                  }`}
                >
                  {m === 'semantic'
                    ? <Sparkles className="h-3 w-3" />
                    : <Hash className="h-3 w-3" />
                  }
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <Field
            label="Uploaded after"
            type="date"
            value={uploadedAfter}
            onChange={(e) => setUploadedAfter(e.target.value)}
            className="py-2"
          />
          <Field
            label="Uploaded before"
            type="date"
            value={uploadedBefore}
            onChange={(e) => setUploadedBefore(e.target.value)}
            className="py-2"
          />
        </div>
      </form>

      {/* ── Results ── */}
      {results === null ? (
        <EmptyState
          icon={<SearchIcon className="h-7 w-7" />}
          title="Search your documents"
          description="Semantic search finds conceptually related passages; keyword search finds exact matches."
        />
      ) : results.length === 0 ? (
        <EmptyState
          icon={<SearchIcon className="h-7 w-7" />}
          title="No matches found"
          description="Try a different query or search mode."
        />
      ) : (
        <div className="flex flex-col gap-3">
          <p className="font-mono text-[11px] uppercase tracking-widest text-ink/40 dark:text-ink-dark/40">
            {results.length} result{results.length === 1 ? '' : 's'} · {mode} search
          </p>
          {results.map((r, i) => (
            <div
              key={`${r.document_id}-${r.page}-${i}`}
              className="rounded-2xl border border-line/60 bg-surface p-5 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5 dark:border-line-dark dark:bg-surface-dark dark:shadow-card-dark animate-fade-in-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {/* Result header */}
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/15">
                    <FileText className="h-3.5 w-3.5 text-primary dark:text-primary-300" />
                  </div>
                  <span className="font-body text-sm font-semibold text-ink dark:text-ink-dark">
                    {r.document_name}
                  </span>
                  <span className="rounded-full bg-line/60 px-2 py-0.5 font-mono text-[10px] text-ink/50 dark:bg-line-dark dark:text-ink-dark/50">
                    p.{r.page}
                  </span>
                </div>
                {r.similarity !== null && (
                  <span className="shrink-0 rounded-full bg-gradient-to-r from-primary/15 to-accent/10 px-2.5 py-1 font-mono text-[11px] font-medium text-primary dark:from-primary/20 dark:to-accent/15 dark:text-primary-300">
                    {(r.similarity * 100).toFixed(0)}% match
                  </span>
                )}
              </div>
              {/* Snippet */}
              <p className="font-body text-sm leading-relaxed text-ink/70 dark:text-ink-dark/70 border-l-2 border-primary/30 pl-3.5 dark:border-primary/25">
                {r.snippet}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
