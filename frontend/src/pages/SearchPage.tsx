import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  Search as SearchIcon, FileText, Sparkles, Hash,
  MessageSquare
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
    <div className="flex flex-col gap-8">
      {/* ── Header ── */}
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 text-primary-500" />
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
            Vector Similarity & Passage Finder
          </span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Deep Search
        </h1>
        <p className="mt-1 font-body text-sm text-slate-500 dark:text-slate-400">
          Find matching text chunks and passages across all documents without synthesizing a summary.
        </p>
      </div>

      {/* ── Search Bar & Filter Controls ── */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card dark:border-slate-800/80 dark:bg-slate-900 animate-fade-in-up"
        style={{ animationDelay: '80ms' }}
      >
        {/* Search input field */}
        <div className="relative flex items-center gap-3 rounded-2xl border border-slate-300/80 bg-slate-50/70 px-4 py-3 shadow-xs transition-all duration-200 focus-within:border-primary-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary-500/10 dark:border-slate-700/80 dark:bg-slate-950/60 dark:focus-within:bg-slate-900">
          <SearchIcon className="h-5 w-5 shrink-0 text-slate-400 dark:text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your search term, topic, or concept…"
            className="flex-1 bg-transparent font-body text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          <Button type="submit" size="md" variant="glow" loading={loading} disabled={!query.trim()}>
            Search Index
          </Button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Mode Switch Pills */}
          <div className="flex items-center gap-2">
            <span className="font-body text-xs font-medium text-slate-500 dark:text-slate-400">Search Engine:</span>
            <div className="flex rounded-xl border border-slate-200 bg-slate-100/80 p-1 dark:border-slate-800 dark:bg-slate-950">
              <button
                type="button"
                onClick={() => setMode('semantic')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-body text-xs font-semibold transition-all duration-200 ${
                  mode === 'semantic'
                    ? 'bg-white text-primary-700 shadow-xs dark:bg-slate-800 dark:text-primary-300'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-primary-500" />
                Semantic (Vector)
              </button>
              <button
                type="button"
                onClick={() => setMode('keyword')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-body text-xs font-semibold transition-all duration-200 ${
                  mode === 'keyword'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-slate-100'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Hash className="h-3.5 w-3.5 text-slate-500" />
                Exact Keyword
              </button>
            </div>
          </div>

          {/* Date range filters */}
          <div className="flex items-center gap-3">
            <Field
              label="Uploaded After"
              type="date"
              value={uploadedAfter}
              onChange={(e) => setUploadedAfter(e.target.value)}
              className="py-1 text-xs"
            />
            <Field
              label="Uploaded Before"
              type="date"
              value={uploadedBefore}
              onChange={(e) => setUploadedBefore(e.target.value)}
              className="py-1 text-xs"
            />
          </div>
        </div>
      </form>

      {/* ── Search Results ── */}
      {results === null ? (
        <EmptyState
          icon={<SearchIcon className="h-7 w-7" />}
          title="Search your knowledge base"
          description="Semantic vector search matches concepts and meanings; exact keyword matches literal phrases."
        />
      ) : results.length === 0 ? (
        <EmptyState
          icon={<SearchIcon className="h-7 w-7" />}
          title="No matching passages found"
          description="Try broadening your query keywords or changing the search mode."
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Found {results.length} relevant passage{results.length === 1 ? '' : 's'}
            </span>
            <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
              Ranked by similarity score
            </span>
          </div>

          {results.map((r, i) => (
            <div
              key={`${r.document_id}-${r.page}-${i}`}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition-all duration-200 hover:border-primary/40 hover:shadow-card-hover dark:border-slate-800/80 dark:bg-slate-900 animate-fade-in-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-body text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                    {r.document_name}
                  </span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    Page {r.page}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {r.similarity !== null && (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40">
                      {(r.similarity * 100).toFixed(0)}% Relevance
                    </span>
                  )}
                  <Link to="/chat">
                    <Button variant="ghost" size="xs" className="gap-1 text-primary-600 dark:text-primary-400">
                      <MessageSquare className="h-3 w-3" />
                      Ask this doc
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Passage Snippet */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 dark:border-slate-800/60 dark:bg-slate-950/50">
                <p className="font-body text-xs leading-relaxed text-slate-700 dark:text-slate-300">
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
