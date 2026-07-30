import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileStack, MessageSquare, HardDrive, Clock } from 'lucide-react'
import { getDashboard } from '../lib/api'
import type { DashboardData } from '../types'
import { Card, Skeleton, Badge } from '../components/ui/primitives'
import { ConfidenceMeter } from '../components/ConfidenceMeter'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function StatCard({ icon: Icon, label, value }: { icon: typeof FileStack; label: string; value: string }) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <div className="citation-tab flex h-10 w-10 items-center justify-center rounded-full p-0">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="font-mono text-[11px] uppercase tracking-wide text-ink/40 dark:text-ink-dark/40">
          {label}
        </p>
        <p className="font-display text-2xl font-semibold text-ink dark:text-ink-dark">{value}</p>
      </div>
    </Card>
  )
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard()
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink dark:text-ink-dark">Dashboard</h1>
        <p className="mt-1 font-body text-sm text-ink/60 dark:text-ink-dark/60">
          An overview of your documents and activity.
        </p>
      </div>

      {loading || !data ? (
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          <StatCard icon={FileStack} label="Documents" value={String(data.total_documents)} />
          <StatCard icon={MessageSquare} label="Questions Asked" value={String(data.total_questions_asked)} />
          <StatCard icon={HardDrive} label="Storage Used" value={formatBytes(data.storage_used_bytes)} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h2 className="mb-3 flex items-center gap-1.5 font-display text-base font-semibold text-ink dark:text-ink-dark">
            <FileStack className="h-4 w-4" /> Recent documents
          </h2>
          <Card>
            {loading || !data ? (
              <div className="flex flex-col gap-3 p-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            ) : data.recent_documents.length === 0 ? (
              <p className="p-6 text-center font-body text-sm text-ink/50 dark:text-ink-dark/50">
                No documents yet.{' '}
                <Link to="/documents" className="text-signal hover:underline dark:text-signal-dark">
                  Upload one
                </Link>
                .
              </p>
            ) : (
              <ul className="divide-y divide-line dark:divide-line-dark">
                {data.recent_documents.map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <span className="truncate font-body text-sm text-ink dark:text-ink-dark">
                      {doc.original_filename}
                    </span>
                    <Badge tone={doc.status === 'ready' ? 'success' : doc.status === 'failed' ? 'danger' : 'neutral'}>
                      {doc.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div>
          <h2 className="mb-3 flex items-center gap-1.5 font-display text-base font-semibold text-ink dark:text-ink-dark">
            <Clock className="h-4 w-4" /> Recent questions
          </h2>
          <Card>
            {loading || !data ? (
              <div className="flex flex-col gap-3 p-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            ) : data.recent_questions.length === 0 ? (
              <p className="p-6 text-center font-body text-sm text-ink/50 dark:text-ink-dark/50">
                No questions asked yet.{' '}
                <Link to="/chat" className="text-signal hover:underline dark:text-signal-dark">
                  Ask something
                </Link>
                .
              </p>
            ) : (
              <ul className="divide-y divide-line dark:divide-line-dark">
                {data.recent_questions.map((q) => (
                  <li key={q.id} className="flex flex-col gap-1.5 px-4 py-3">
                    <span className="truncate font-body text-sm text-ink dark:text-ink-dark">{q.question}</span>
                    <ConfidenceMeter value={q.confidence} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
