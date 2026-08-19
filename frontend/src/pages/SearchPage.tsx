import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  Search as SearchIcon, FileText, ChevronRight, MessageSquare,
  SlidersHorizontal, Check
} from 'lucide-react'
import { extractErrorMessage, listDocuments, searchDocuments } from '../lib/api'
import type { DocumentItem, SearchResultItem } from '../types'
import { Button } from '../components/ui/Button'
import { Skeleton, EmptyState } from '../components/ui/primitives'
import { useToast } from '../contexts/ToastContext'

export function SearchPage() {
  const { notify } = useToast()
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<'semantic' | 'keyword'>('semantic')
  const [topK, setTopK] = useState(5)
  const [uploadedAfter, setUploadedAfter] = useState('')
  const [availableDocs, setAvailableDocs] = useState<DocumentItem[]>([])
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [totalResults, setTotalResults] = useState<number | null>(null)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    listDocuments()
      .then((res) => setAvailableDocs(res.documents.filter((d) => d.status === 'ready')))
      .catch(() => {})
  }, [])

  async function handleSearch(e?: FormEvent) {
    if (e) e.preventDefault()
    if (!query.trim()) return

    setSearching(true)
    try {
      const res = await searchDocuments({
        query: query.trim(),
        mode,
        top_k: topK,
        document_ids: selectedDocIds.length ? selectedDocIds : undefined,
        uploaded_after: uploadedAfter || undefined,
      })
      setResults(res.results)
      setTotalResults(res.total_results)
    } catch (err) {
      notify(extractErrorMessage(err, 'Search failed.'), 'error')
    } finally {
      setSearching(false)
    }
  }

  function toggleDocSelection(id: string) {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 dark:border-slate-800">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Deep Search
        </h1>
        <p className="mt-1.5 font-sans text-sm sm:text-base text-slate-500 dark:text-slate-400">
          Query indexed knowledge chunks via vector cosine similarity or exact keyword matching.
        </p>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="flex flex-col gap-4">
        <div className="relative flex items-center">
          <SearchIcon className="pointer-events-none absolute left-4 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search keywords, concepts, or technical terms…"
            className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-12 pr-32 font-sans text-sm sm:text-base text-slate-900 placeholder:text-slate-400 shadow-xs focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          <div className="absolute right-2 flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowFilters((s) => !s)}
              className={`gap-1.5 ${showFilters ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={searching} disabled={!query.trim()}>
              Search
            </Button>
          </div>
        </div>

        {/* Collapsible Filter Panel */}
        {showFilters && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Search Mode */}
              <div>
                <label className="font-mono text-xs font-semibold uppercase text-slate-500">Retrieval Mode</label>
                <div className="mt-1.5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('semantic')}
                    className={`flex-1 rounded-lg border px-3 py-2 font-sans text-xs sm:text-sm font-medium transition-colors ${
                      mode === 'semantic'
                        ? 'border-brand-600 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-950/60 dark:text-brand-300'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    Vector Semantic
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('keyword')}
                    className={`flex-1 rounded-lg border px-3 py-2 font-sans text-xs sm:text-sm font-medium transition-colors ${
                      mode === 'keyword'
                        ? 'border-brand-600 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-950/60 dark:text-brand-300'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    Exact Keyword
                  </button>
                </div>
              </div>

              {/* Top K */}
              <div>
                <label className="font-mono text-xs font-semibold uppercase text-slate-500">Result Limit</label>
                <select
                  value={topK}
                  onChange={(e) => setTopK(Number(e.target.value))}
                  className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 font-sans text-sm text-slate-700 focus:border-brand-600 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <option value={3}>Top 3 passages</option>
                  <option value={5}>Top 5 passages</option>
                  <option value={10}>Top 10 passages</option>
                  <option value={20}>Top 20 passages</option>
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label className="font-mono text-xs font-semibold uppercase text-slate-500">Date Uploaded After</label>
                <input
                  type="date"
                  value={uploadedAfter}
                  onChange={(e) => setUploadedAfter(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 font-sans text-sm text-slate-700 focus:border-brand-600 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            {/* Document Scoping Pills */}
            {availableDocs.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="font-mono text-xs font-semibold uppercase text-slate-500">
                  Filter by Document ({selectedDocIds.length ? `${selectedDocIds.length} selected` : 'All'})
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {availableDocs.map((doc) => {
                    const active = selectedDocIds.includes(doc.id)
                    return (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => toggleDocSelection(doc.id)}
                        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-sans text-xs font-medium transition-colors ${
                          active
                            ? 'border-brand-600 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-950/60 dark:text-brand-300'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {active && <Check className="h-3 w-3" />}
                        <span className="truncate max-w-[180px]">{doc.original_filename}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </form>

      {/* Results Section */}
      {searching ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : totalResults !== null && results.length === 0 ? (
        <EmptyState
          icon={<SearchIcon className="h-6 w-6" />}
          title="No matching passages found"
          description={`We couldn't find any relevant chunks for "${query}". Try refining your keywords or selecting Semantic search mode.`}
        />
      ) : (
        <div className="space-y-4">
          {totalResults !== null && (
            <div className="flex items-center justify-between font-mono text-xs text-slate-500">
              <span>Returned {results.length} matching passage{results.length === 1 ? '' : 's'}</span>
              <span>Mode: {mode === 'semantic' ? 'Cosine Vector Similarity' : 'Lexical Keyword Match'}</span>
            </div>
          )}

          {results.map((r, i) => (
            <div
              key={`${r.document_id}-${r.page}-${i}`}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
            >
              {/* Result Meta Bar */}
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="truncate font-sans text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {r.document_name}
                  </span>
                  <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    Page {r.page}
                  </span>
                </div>

                {r.similarity !== null && r.similarity !== undefined && (
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-500">Score</span>
                    <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                      {(r.similarity * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Snippet */}
              <div className="rounded-lg bg-slate-50 p-4 font-sans text-xs sm:text-sm leading-relaxed text-slate-700 dark:bg-slate-950/60 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                "{r.snippet}"
              </div>

              {/* Footer */}
              <div className="mt-3 flex justify-end">
                <Link to="/chat">
                  <Button variant="ghost" size="xs" className="gap-1 text-brand-600 dark:text-brand-400">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Inquire about this section</span>
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
