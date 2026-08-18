import { useCallback, useEffect, useRef, useState } from 'react'
import { FileStack, Upload, Trash2, FileText, CloudUpload, CheckCircle2 } from 'lucide-react'
import { deleteDocument, extractErrorMessage, listDocuments, uploadDocument } from '../lib/api'
import type { DocumentItem } from '../types'
import { Badge, Skeleton, EmptyState } from '../components/ui/primitives'
import { useToast } from '../contexts/ToastContext'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function DocumentsPage() {
  const { notify } = useToast()
  const [documents, setDocuments]     = useState<DocumentItem[]>([])
  const [totalStorage, setTotalStorage] = useState(0)
  const [loading, setLoading]         = useState(true)
  const [uploading, setUploading]     = useState(false)
  const [progress, setProgress]       = useState(0)
  const [dragOver, setDragOver]       = useState(false)
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
      notify(`${file.name} uploaded and processed.`)
      await refresh()
    } catch (err) {
      notify(extractErrorMessage(err, 'Upload failed.'), 'error')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  async function handleDelete(doc: DocumentItem) {
    if (!confirm(`Delete "${doc.original_filename}"? This can't be undone.`)) return
    try {
      await deleteDocument(doc.id)
      notify(`${doc.original_filename} deleted.`)
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

  return (
    <div className="flex flex-col gap-8">
      {/* ── Header ── */}
      <div className="flex items-start justify-between animate-fade-in-up">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink dark:text-ink-dark tracking-tight">
            Documents
          </h1>
          <p className="mt-1 font-body text-sm text-ink/55 dark:text-ink-dark/55">
            {documents.length} document{documents.length === 1 ? '' : 's'} · {formatBytes(totalStorage)} used
          </p>
        </div>
      </div>

      {/* ── Drop zone ── */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-8 py-12 text-center cursor-pointer transition-all duration-300 group ${
          dragOver
            ? 'border-primary bg-primary/8 shadow-glow-sm scale-[1.01] dark:bg-primary/12'
            : uploading
            ? 'border-primary/40 bg-primary/5 dark:border-primary/30 dark:bg-primary/8'
            : 'border-line/80 hover:border-primary/50 hover:bg-primary/5 dark:border-line-dark dark:hover:border-primary/40 dark:hover:bg-primary/8'
        }`}
      >
        {/* Background glow when dragging */}
        {dragOver && (
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/5" />
        )}

        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 ${
          dragOver
            ? 'bg-primary text-white shadow-glow-primary scale-110'
            : 'bg-primary/10 text-primary group-hover:bg-primary/15 dark:bg-primary/15 dark:text-primary-300'
        }`}>
          {uploading
            ? <CloudUpload className="h-6 w-6 animate-bounce" />
            : <Upload className="h-6 w-6" />
          }
        </div>

        <div>
          <p className="font-body text-sm font-medium text-ink dark:text-ink-dark">
            {dragOver
              ? 'Drop to upload'
              : uploading
              ? 'Uploading...'
              : 'Drag & drop your file here'
            }
          </p>
          {!uploading && (
            <p className="mt-0.5 font-body text-xs text-ink/45 dark:text-ink-dark/45">
              or{' '}
              <span className="text-primary font-medium hover:underline dark:text-primary-300">
                browse files
              </span>
              {' '}— PDF, DOCX, TXT (max 25 MB)
            </p>
          )}
        </div>

        {/* Upload progress */}
        {uploading && (
          <div className="w-64 space-y-1.5">
            <div className="h-2 overflow-hidden rounded-full bg-line/60 dark:bg-line-dark">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="font-mono text-[11px] text-ink/50 dark:text-ink-dark/50">
              {progress < 100 ? `Uploading… ${progress}%` : 'Processing — embedding & indexing…'}
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

      {/* ── Document list ── */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          icon={<FileStack className="h-7 w-7" />}
          title="No documents yet"
          description="Upload a PDF, DOCX, or TXT file above to start asking questions about it."
        />
      ) : (
        <div className="rounded-2xl border border-line/60 bg-surface shadow-card overflow-hidden dark:border-line-dark dark:bg-surface-dark dark:shadow-card-dark">
          <ul className="divide-y divide-line/60 dark:divide-line-dark">
            {documents.map((doc, idx) => (
              <li
                key={doc.id}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-primary/3 dark:hover:bg-primary/5 transition-colors animate-fade-in"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <div className="flex min-w-0 items-center gap-3.5">
                  {/* File icon */}
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    doc.status === 'ready'
                      ? 'bg-success/10 dark:bg-success-dark/15'
                      : doc.status === 'failed'
                      ? 'bg-danger/10 dark:bg-danger-dark/15'
                      : 'bg-primary/10 dark:bg-primary/15'
                  }`}>
                    {doc.status === 'ready'
                      ? <CheckCircle2 className="h-4.5 w-4.5 text-success dark:text-success-dark" />
                      : <FileText className={`h-4.5 w-4.5 ${
                          doc.status === 'failed'
                            ? 'text-danger dark:text-danger-dark'
                            : 'text-primary dark:text-primary-300'
                        }`} />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-body text-sm font-medium text-ink dark:text-ink-dark">
                      {doc.original_filename}
                    </p>
                    <p className="font-mono text-[10px] text-ink/40 dark:text-ink-dark/40 mt-0.5">
                      {doc.page_count} page{doc.page_count === 1 ? '' : 's'} · {doc.chunk_count} chunks · {formatBytes(doc.file_size_bytes)}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Badge tone={doc.status === 'ready' ? 'success' : doc.status === 'failed' ? 'danger' : 'neutral'}>
                    {doc.status}
                  </Badge>
                  <button
                    onClick={() => handleDelete(doc)}
                    aria-label={`Delete ${doc.original_filename}`}
                    className="rounded-lg p-2 text-ink/35 hover:bg-danger/10 hover:text-danger dark:text-ink-dark/35 dark:hover:bg-danger/15 dark:hover:text-danger-dark transition-colors"
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
