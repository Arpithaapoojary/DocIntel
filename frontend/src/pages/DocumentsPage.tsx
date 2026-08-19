import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileStack, Upload, Trash2, FileText, CheckCircle2,
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
      notify(`${doc.original_filename} removed from index.`)
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
      {/* Header & Vault Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Documents
          </h1>
          <p className="mt-1.5 font-sans text-sm sm:text-base text-slate-500 dark:text-slate-400">
            Upload and manage the knowledge base for grounded question answering.
          </p>
        </div>

        {/* Vault Stats Pills */}
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-2 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
            <span className="font-mono text-xs uppercase text-slate-500">Storage</span>
            <p className="font-mono text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">{formatBytes(totalStorage)}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-2 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
            <span className="font-mono text-xs uppercase text-slate-500">Chunks</span>
            <p className="font-mono text-sm sm:text-base font-semibold text-brand-600 dark:text-brand-400">{totalChunks}</p>
          </div>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-3.5 rounded-xl border-2 border-dashed px-8 py-10 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-brand-500 bg-brand-50/40 dark:border-brand-500 dark:bg-brand-950/20'
            : uploading
            ? 'border-brand-400 bg-slate-50 dark:border-slate-700 dark:bg-slate-900'
            : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/70 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600'
        }`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
          <Upload className="h-6 w-6" />
        </div>

        <div>
          <p className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
            {dragOver ? 'Drop file to upload' : uploading ? 'Ingesting and indexing document…' : 'Click to upload or drag and drop'}
          </p>
          {!uploading && (
            <p className="mt-1.5 font-sans text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              PDF, DOCX, or TXT up to 25 MB. Embeddings are generated automatically.
            </p>
          )}
        </div>

        {/* Upload Progress Bar */}
        {uploading && (
          <div className="w-72 space-y-2 mt-2">
            <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-brand-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
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

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search documents…"
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 font-sans text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3.5 font-sans text-sm text-slate-700 focus:border-brand-600 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 shadow-xs cursor-pointer"
          >
            <option value="all">All Statuses ({documents.length})</option>
            <option value="ready">Ready only</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : filteredDocs.length === 0 ? (
        <EmptyState
          icon={<FileStack className="h-6 w-6" />}
          title={searchFilter ? 'No matching documents' : 'No documents in repository'}
          description={
            searchFilter
              ? 'Try modifying your search query or filter.'
              : 'Upload a document above to begin querying with the AI assistant.'
          }
        />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 font-mono text-xs uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                  <th className="px-5 py-3.5 font-semibold">Document</th>
                  <th className="px-5 py-3.5 font-semibold">Pages</th>
                  <th className="px-5 py-3.5 font-semibold">Chunks</th>
                  <th className="px-5 py-3.5 font-semibold">Size</th>
                  <th className="px-5 py-3.5 font-semibold">Uploaded</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans dark:divide-slate-800">
                {filteredDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
                          {doc.status === 'ready' ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-sm">
                          {doc.original_filename}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-600 dark:text-slate-400">
                      {doc.page_count}
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-600 dark:text-slate-400">
                      {doc.chunk_count}
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-600 dark:text-slate-400">
                      {formatBytes(doc.file_size_bytes)}
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-500 dark:text-slate-400">
                      {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        tone={doc.status === 'ready' ? 'success' : doc.status === 'failed' ? 'danger' : 'neutral'}
                        dot={doc.status === 'ready'}
                      >
                        {doc.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-2.5">
                        {doc.status === 'ready' && (
                          <Link to="/chat">
                            <Button variant="outline" size="sm" className="gap-1.5">
                              <MessageSquare className="h-3.5 w-3.5" />
                              Ask
                            </Button>
                          </Link>
                        )}
                        <button
                          onClick={() => handleDelete(doc)}
                          aria-label={`Delete ${doc.original_filename}`}
                          title="Delete document"
                          className="rounded p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
