import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileStack, Upload, Trash2, FileText, CloudUpload, CheckCircle2,
  Search, MessageSquare, Filter
} from 'lucide-react'
import { deleteDocument, extractErrorMessage, listDocuments, uploadDocument } from '../lib/api'
import type { DocumentItem } from '../types'
import { Badge, Skeleton, EmptyState } from '../components/ui/primitives'
import { Button } from '../components/ui/Button'
import { useToast } from '../contexts/ToastContext'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function DocumentsPage() {
  const { notify } = useToast()
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [totalStorage, setTotalStorage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [searchFilter, setSearchFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const refresh = useCallback(async () => {
    const data = await listDocuments()
    setDocuments(data.documents)
    setTotalStorage(data.total_storage_bytes)
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  async function handleUpload(file: File) {
    setUploading(true)
    setProgress(0)
    try {
      await uploadDocument(file, setProgress)
      notify(`${file.name} uploaded and indexed successfully.`)
      await refresh()
    } catch (err) {
      notify(extractErrorMessage(err, 'Upload failed.'), 'error')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  async function handleDelete(doc: DocumentItem) {
    if (!confirm(`Delete "${doc.original_filename}"? This will remove its vector embeddings.`)) return
    try {
      await deleteDocument(doc.id)
      notify(`${doc.original_filename} removed.`)
      await refresh()
    } catch (err) {
      notify(extractErrorMessage(err, 'Could not delete document.'), 'error')
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleUpload(file)
  }

  const totalChunks = documents.reduce((sum, d) => sum + d.chunk_count, 0)

  const filteredDocs = documents.filter((d) => {
    const matchesSearch = d.original_filename.toLowerCase().includes(searchFilter.toLowerCase())
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex flex-col gap-8">
      {/* ── Header & Storage Summary ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Document Vault
          </h1>
          <p className="mt-1 font-body text-sm text-slate-500 dark:text-slate-400">
            Upload, manage, and inspect indexed documents used for grounded AI responses.
          </p>
        </div>

        {/* Knowledge Metrics Pills */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-slate-200/80 bg-white px-4 py-2 dark:border-slate-800/80 dark:bg-slate-900 shadow-xs">
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">Vault Size</span>
            <p className="font-display text-sm font-bold text-slate-900 dark:text-slate-100">{formatBytes(totalStorage)}</p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white px-4 py-2 dark:border-slate-800/80 dark:bg-slate-900 shadow-xs">
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Chunks</span>
            <p className="font-display text-sm font-bold text-primary-600 dark:text-primary-400">{totalChunks}</p>
          </div>
        </div>
      </div>

      {/* ── Drag & Drop Upload Zone ── */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-3.5 rounded-3xl border-2 border-dashed px-8 py-12 text-center cursor-pointer transition-all duration-300 ${
          dragOver
            ? 'border-primary-500 bg-primary-50/50 shadow-glow-primary scale-[1.01] dark:border-primary-500 dark:bg-primary-950/30'
            : uploading
            ? 'border-primary-400 bg-primary-50/20 dark:border-primary-600 dark:bg-primary-950/20'
            : 'border-slate-300/90 bg-white hover:border-primary-400 hover:bg-slate-50/70 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900 dark:hover:border-primary-500/70 dark:hover:bg-slate-800/50'
        }`}
      >
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 ${
          dragOver
            ? 'bg-primary-600 text-white shadow-glow-primary scale-110'
            : 'bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400'
        }`}>
          {uploading ? (
            <CloudUpload className="h-7 w-7 animate-bounce" />
          ) : (
            <Upload className="h-7 w-7" />
          )}
        </div>

        <div className="max-w-md">
          <p className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
            {dragOver ? 'Drop your document here' : uploading ? 'Ingesting and indexing document…' : 'Drag & drop your files to index'}
          </p>
          {!uploading && (
            <p className="mt-1 font-body text-xs text-slate-500 dark:text-slate-400">
              Supports <strong className="text-slate-700 dark:text-slate-300">PDF, DOCX, TXT</strong> up to 25 MB. Automatic text extraction & semantic vector embedding.
            </p>
          )}
        </div>

        {/* Progress Bar */}
        {uploading && (
          <div className="w-72 space-y-2 mt-2">
            <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-600 to-accent transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
              {progress < 100 ? `Uploading… ${progress}%` : 'Vector chunking & embedding in progress…'}
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleUpload(file)
            e.target.value = ''
          }}
        />
      </div>

      {/* ── Document Search & Filter Toolbar ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter files by name…"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-xs font-body text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-body text-slate-700 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 shadow-xs cursor-pointer"
          >
            <option value="all">All Statuses ({documents.length})</option>
            <option value="ready">Ready only</option>
            <option value="indexing">Indexing</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* ── Documents Collection Table ── */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
      ) : filteredDocs.length === 0 ? (
        <EmptyState
          icon={<FileStack className="h-7 w-7" />}
          title={searchFilter ? 'No matching files found' : 'No documents in vault'}
          description={
            searchFilter
              ? 'Try adjusting your search query.'
              : 'Upload your first PDF, DOCX, or TXT file above to enable AI question answering.'
          }
        />
      ) : (
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-card overflow-hidden dark:border-slate-800/80 dark:bg-slate-900">
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredDocs.map((doc, idx) => (
              <li
                key={doc.id}
                className="flex items-center justify-between gap-4 p-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors animate-fade-in"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* File Format Badge Icon */}
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                    doc.status === 'ready'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                      : doc.status === 'failed'
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
                      : 'bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400'
                  }`}>
                    {doc.status === 'ready' ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <FileText className="h-5 w-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-body text-sm font-bold text-slate-900 dark:text-slate-100">
                      {doc.original_filename}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[11px] text-slate-400 dark:text-slate-500">
                      <span>{doc.page_count} {doc.page_count === 1 ? 'page' : 'pages'}</span>
                      <span>·</span>
                      <span>{doc.chunk_count} vector chunks</span>
                      <span>·</span>
                      <span>{formatBytes(doc.file_size_bytes)}</span>
                      <span>·</span>
                      <span>{doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : '—'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Badge
                    tone={doc.status === 'ready' ? 'success' : doc.status === 'failed' ? 'danger' : 'neutral'}
                    dot={doc.status === 'ready'}
                  >
                    {doc.status}
                  </Badge>

                  {doc.status === 'ready' && (
                    <Link to="/chat">
                      <Button variant="secondary" size="xs" className="gap-1.5 hidden sm:inline-flex">
                        <MessageSquare className="h-3 w-3" />
                        Ask AI
                      </Button>
                    </Link>
                  )}

                  <button
                    onClick={() => handleDelete(doc)}
                    aria-label={`Delete ${doc.original_filename}`}
                    title="Delete document and vector embeddings"
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/60 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
