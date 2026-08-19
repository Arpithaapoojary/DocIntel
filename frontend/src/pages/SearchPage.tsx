import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  Search as SearchIcon, FileText, Hash, Layers, MessageSquare
} from 'lucide-react'
import { extractErrorMessage, searchDocuments } from '../lib/api'
import type { SearchResultItem } from '../types'
import { EmptyState, Field } from '../components/ui/primitives'
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
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 dark:border-slate-800">
        <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
          Deep Search
        </h1>
        <p className="mt-1 font-sans text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Query vector embeddings or run exact keyword matching across all stored document chunks.
        </p>
      </div>

      {/* Search Input and Filters */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900"
      >
        {/* Search bar */}
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search concepts, queries, or exact terms across documents…"
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-3 font-sans text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>
          <Button type="submit" size="md" variant="primary" loading={loading} disabled={!query.trim()}>
            Search
          </Button>
        </div>

        {/* Filters and mode toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-sans text-xs text-slate-500">Mode:</span>
            <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-800 dark:bg-slate-950">
              <button
                type="button"
                onClick={() => setMode('semantic')}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 font-sans text-xs font-medium transition-colors ${
                  mode === 'semantic'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-slate-100'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Layers className="h-3 w-3" />
                Semantic (Vector)
              </button>
              <button
                type="button"
                onClick={() => setMode('keyword')}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 font-sans text-xs font-medium transition-colors ${
                  mode === 'keyword'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-slate-100'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Hash className="h-3 w-3" />
                Exact Keyword
              </button>
            </div>
          </div>

          {/* Date range filters */}
          <div className="flex items-center gap-2">
            <Field
              label="After"
              type="date"
              value={uploadedAfter}
              onChange={(e) => setUploadedAfter(e.target.value)}
              className="py-1 text-xs"
            />
            <Field
              label="Before"
              type="date"
              value={uploadedBefore}
              onChange={(e) => setUploadedBefore(e.target.value)}
              className="py-1 text-xs"
            />
          </div>
        </div>
      </form>

      {/* Results */}
      {results === null ? (
        <EmptyState
          icon={<SearchIcon className="h-5 w-5" />}
          title="Search your knowledge index"
          description="Vector search matches conceptual context; exact keyword search matches literal phrases."
        />
      ) : results.length === 0 ? (
        <EmptyState
          icon={<SearchIcon className="h-5 w-5" />}
          title="No matching passages found"
          description="Try broadening your query keywords or switching between semantic and keyword modes."
        />
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
              Found {results.length} relevant passage{results.length === 1 ? '' : 's'}
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              Ranked by similarity
            </span>
          </div>

          {results.map((r, i) => (
            <div
              key={`${r.document_id}-${r.page}-${i}`}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="font-sans text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {r.document_name}
                  </span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.2 font-mono text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    p. {r.page}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {r.similarity !== null && (
                    <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[10px] font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
                      {(r.similarity * 100).toFixed(0)}% Match
                    </span>
                  )}
                  <Link to="/chat">
                    <Button variant="outline" size="xs" className="gap-1">
                      <MessageSquare className="h-3 w-3" />
                      Ask
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Passage Snippet */}
              <div className="rounded border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                <p className="font-sans text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  "{r.snippet}"
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
