import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileStack, MessageSquare, HardDrive, Clock, ArrowRight, TrendingUp } from 'lucide-react'
import { getDashboard } from '../lib/api'
import type { DashboardData } from '../types'
import { Skeleton, Badge } from '../components/ui/primitives'
import { ConfidenceMeter } from '../components/ConfidenceMeter'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface StatCardProps {
  icon: typeof FileStack
  label: string
  value: string
  gradient: string
  delay?: string
}

function StatCard({ icon: Icon, label, value, gradient, delay = '0ms' }: StatCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-line/60 bg-surface p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 dark:border-line-dark dark:bg-surface-dark dark:shadow-card-dark animate-fade-in-up"
      style={{ animationDelay: delay }}
    >
      {/* Background glow */}
      <div className={`pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full blur-2xl opacity-30 ${gradient}`} />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-ink/40 dark:text-ink-dark/40">
            {label}
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-ink dark:text-ink-dark">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-sm`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
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
      {/* ── Header ── */}
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="h-5 w-5 text-primary" />
          <span className="font-mono text-xs uppercase tracking-widest text-primary font-medium">Overview</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-ink dark:text-ink-dark tracking-tight">
          Dashboard
        </h1>
        <p className="mt-1 font-body text-sm text-ink/55 dark:text-ink-dark/55">
          An overview of your documents and recent activity.
        </p>
      </div>

      {/* ── Stat cards ── */}
      {loading || !data ? (
        <div className="grid grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          <StatCard
            icon={FileStack}
            label="Documents"
            value={String(data.total_documents)}
            gradient="from-primary to-primary-600"
            delay="0ms"
          />
          <StatCard
            icon={MessageSquare}
            label="Questions Asked"
            value={String(data.total_questions_asked)}
            gradient="from-accent to-primary"
            delay="80ms"
          />
          <StatCard
            icon={HardDrive}
            label="Storage Used"
            value={formatBytes(data.storage_used_bytes)}
            gradient="from-success to-accent"
            delay="160ms"
          />
        </div>
      )}

      {/* ── Recent activity ── */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent documents */}
        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink dark:text-ink-dark">
              <FileStack className="h-4 w-4 text-primary" />
              Recent Documents
            </h2>
            <Link
              to="/documents"
              className="flex items-center gap-1 font-body text-xs text-primary hover:text-primary-600 dark:text-primary-300 transition-colors"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="rounded-2xl border border-line/60 bg-surface shadow-card dark:border-line-dark dark:bg-surface-dark dark:shadow-card-dark overflow-hidden">
            {loading || !data ? (
              <div className="flex flex-col gap-3 p-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10" />)}
              </div>
            ) : data.recent_documents.length === 0 ? (
              <p className="p-8 text-center font-body text-sm text-ink/45 dark:text-ink-dark/45">
                No documents yet.{' '}
                <Link to="/documents" className="text-primary hover:underline dark:text-primary-300 font-medium">
                  Upload one
                </Link>
                .
              </p>
            ) : (
              <ul className="divide-y divide-line/60 dark:divide-line-dark">
                {data.recent_documents.map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-primary/3 dark:hover:bg-primary/5 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/15">
                        <FileStack className="h-3.5 w-3.5 text-primary dark:text-primary-300" />
                      </div>
                      <span className="truncate font-body text-sm font-medium text-ink dark:text-ink-dark">
                        {doc.original_filename}
                      </span>
                    </div>
                    <Badge tone={doc.status === 'ready' ? 'success' : doc.status === 'failed' ? 'danger' : 'neutral'}>
                      {doc.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recent questions */}
        <div className="animate-fade-in-up" style={{ animationDelay: '280ms' }}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink dark:text-ink-dark">
              <Clock className="h-4 w-4 text-accent" />
              Recent Questions
            </h2>
            <Link
              to="/chat"
              className="flex items-center gap-1 font-body text-xs text-primary hover:text-primary-600 dark:text-primary-300 transition-colors"
            >
              Ask more <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="rounded-2xl border border-line/60 bg-surface shadow-card dark:border-line-dark dark:bg-surface-dark dark:shadow-card-dark overflow-hidden">
            {loading || !data ? (
              <div className="flex flex-col gap-3 p-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10" />)}
              </div>
            ) : data.recent_questions.length === 0 ? (
              <p className="p-8 text-center font-body text-sm text-ink/45 dark:text-ink-dark/45">
                No questions asked yet.{' '}
                <Link to="/chat" className="text-primary hover:underline dark:text-primary-300 font-medium">
                  Ask something
                </Link>
                .
              </p>
            ) : (
              <ul className="divide-y divide-line/60 dark:divide-line-dark">
                {data.recent_questions.map((q) => (
                  <li key={q.id} className="flex flex-col gap-2 px-5 py-3.5 hover:bg-primary/3 dark:hover:bg-primary/5 transition-colors">
                    <span className="font-body text-sm font-medium text-ink dark:text-ink-dark line-clamp-1">
                      {q.question}
                    </span>
                    <ConfidenceMeter value={q.confidence} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
