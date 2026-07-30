import { useCallback, useEffect, useRef, useState } from 'react'
import { FileStack, Upload, Trash2, FileText } from 'lucide-react'
import { deleteDocument, extractErrorMessage, listDocuments, uploadDocument } from '../lib/api'
import type { DocumentItem } from '../types'
import { Card, Badge, Skeleton, EmptyState } from '../components/ui/primitives'
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink dark:text-ink-dark">Documents</h1>
          <p className="mt-1 font-body text-sm text-ink/60 dark:text-ink-dark/60">
            {documents.length} document{documents.length === 1 ? '' : 's'} · {formatBytes(totalStorage)} used
          </p>
        </div>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${
          dragOver
            ? 'border-signal bg-signal/5 dark:border-signal-dark dark:bg-signal-dark/10'
            : 'border-line dark:border-line-dark'
        }`}
      >
        <Upload className="h-6 w-6 text-ink/40 dark:text-ink-dark/40" />
        <p className="font-body text-sm text-ink/70 dark:text-ink-dark/70">
          Drag a PDF, DOCX, or TXT file here, or{' '}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="font-medium text-signal hover:underline dark:text-signal-dark"
          >
            browse
          </button>
        </p>
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
        {uploading && (
          <div className="mt-2 w-64">
            <div className="h-1.5 overflow-hidden rounded-full bg-line dark:bg-line-dark">
              <div
                className="h-full rounded-full bg-signal transition-all dark:bg-signal-dark"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 font-mono text-[11px] text-ink/50 dark:text-ink-dark/50">
              {progress < 100 ? `Uploading… ${progress}%` : 'Processing (embedding, indexing)…'}
            </p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          icon={<FileStack className="h-8 w-8" />}
          title="No documents yet"
          description="Upload a file above to start asking questions about it."
        />
      ) : (
        <Card>
          <ul className="divide-y divide-line dark:divide-line-dark">
            {documents.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between gap-4 px-4 py-3.5">
                <div className="flex min-w-0 items-center gap-3">
                  <FileText className="h-4 w-4 shrink-0 text-ink/40 dark:text-ink-dark/40" />
                  <div className="min-w-0">
                    <p className="truncate font-body text-sm text-ink dark:text-ink-dark">
                      {doc.original_filename}
                    </p>
                    <p className="font-mono text-[11px] text-ink/40 dark:text-ink-dark/40">
                      {doc.page_count} page{doc.page_count === 1 ? '' : 's'} · {doc.chunk_count} chunks ·{' '}
                      {formatBytes(doc.file_size_bytes)}
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
                    className="rounded-md p-1.5 text-ink/40 hover:bg-flag/10 hover:text-flag dark:text-ink-dark/40 dark:hover:bg-flag-light/10 dark:hover:text-flag-light"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
