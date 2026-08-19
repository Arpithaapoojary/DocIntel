import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileStack, MessageSquare, HardDrive, Clock, ArrowRight,
  Sparkles, Upload, Search, ShieldCheck, Zap
} from 'lucide-react'
import { getDashboard } from '../lib/api'
import type { DashboardData } from '../types'
import { Skeleton, Badge } from '../components/ui/primitives'
import { Button } from '../components/ui/Button'
import { ConfidenceMeter } from '../components/ConfidenceMeter'
import { useAuth } from '../contexts/AuthContext'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface StatCardProps {
  icon: typeof FileStack
  label: string
  value: string
  trend: string
  gradient: string
  delay?: string
}

function StatCard({ icon: Icon, label, value, trend, gradient, delay = '0ms' }: StatCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 dark:border-slate-800/80 dark:bg-slate-900 dark:shadow-card-dark animate-fade-in-up"
      style={{ animationDelay: delay }}
    >
      <div className={`pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full blur-2xl opacity-20 ${gradient}`} />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">
            {label}
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {value}
          </p>
          <div className="mt-3 flex items-center gap-1.5 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{trend}</span>
          </div>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-sm`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard()
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-8">
      {/* ── Top Hero Greeting Banner ── */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-r from-primary-900 via-indigo-900 to-slate-900 p-8 text-white shadow-xl dark:border-slate-800 animate-fade-in-up">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-primary/25 blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm border border-white/15 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-accent-300" />
              <span>Grounded Document Intelligence Workspace</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {user?.full_name ? user.full_name.split(' ')[0] : 'Knowledge Master'} 👋
            </h1>
            <p className="mt-2 font-body text-sm leading-relaxed text-white/80">
              Your documents are chunked and vector indexed with semantic embeddings. Ask questions or search passages with instant citations.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/documents">
              <Button variant="glow" size="md" className="gap-2 shadow-lg">
                <Upload className="h-4 w-4" />
                Upload File
              </Button>
            </Link>
            <Link to="/chat">
              <Button variant="secondary" size="md" className="gap-2 bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white dark:bg-white/10 dark:text-white">
                <MessageSquare className="h-4 w-4" />
                Ask Assistant
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Metric Stat Cards ── */}
      {loading || !data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            icon={FileStack}
            label="Total Documents"
            value={String(data.total_documents)}
            trend="100% Vector Indexed"
            gradient="from-primary-600 to-indigo-600"
            delay="0ms"
          />
          <StatCard
            icon={MessageSquare}
            label="Queries Answered"
            value={String(data.total_questions_asked)}
            trend="Strict Citations"
            gradient="from-accent-600 to-primary-600"
            delay="50ms"
          />
          <StatCard
            icon={HardDrive}
            label="Knowledge Stored"
            value={formatBytes(data.storage_used_bytes)}
            trend="AES-256 Storage"
            gradient="from-emerald-600 to-teal-600"
            delay="100ms"
          />
          <StatCard
            icon={Zap}
            label="AI Latency"
            value="< 450ms"
            trend="High-Speed Hybrid RAG"
            gradient="from-amber-500 to-rose-500"
            delay="150ms"
          />
        </div>
      )}

      {/* ── Two Column Activity Overview ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Documents Table / Cards */}
        <div className="flex flex-col gap-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                <FileStack className="h-4 w-4" />
              </div>
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                Recent Documents
              </h2>
            </div>
            <Link
              to="/documents"
              className="flex items-center gap-1 font-body text-xs font-semibold text-primary hover:text-primary-600 dark:text-primary-400 transition-colors"
            >
              View all ({data?.total_documents ?? 0}) <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-card dark:border-slate-800/80 dark:bg-slate-900 overflow-hidden">
            {loading || !data ? (
              <div className="flex flex-col gap-3 p-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
              </div>
            ) : data.recent_documents.length === 0 ? (
              <div className="p-8 text-center">
                <p className="font-body text-sm text-slate-500 dark:text-slate-400">
                  No documents in your vault yet.
                </p>
                <Link to="/documents" className="mt-3 inline-block">
                  <Button size="sm" variant="secondary">
                    Upload your first document
                  </Button>
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.recent_documents.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        <FileStack className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-body text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {doc.original_filename}
                        </p>
                        <p className="font-mono text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {doc.page_count} {doc.page_count === 1 ? 'page' : 'pages'} · {doc.chunk_count} chunks
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge
                        tone={doc.status === 'ready' ? 'success' : doc.status === 'failed' ? 'danger' : 'neutral'}
                        dot={doc.status === 'ready'}
                      >
                        {doc.status}
                      </Badge>
                      <Link
                        to="/chat"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-950 dark:hover:text-primary-300 transition-colors"
                        title="Ask about this document"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recent AI Questions Stream */}
        <div className="flex flex-col gap-4 animate-fade-in-up" style={{ animationDelay: '250ms' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-100 text-accent-700 dark:bg-accent-950 dark:text-accent-300">
                <Clock className="h-4 w-4" />
              </div>
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                Recent AI Questions
              </h2>
            </div>
            <Link
              to="/chat"
              className="flex items-center gap-1 font-body text-xs font-semibold text-primary hover:text-primary-600 dark:text-primary-400 transition-colors"
            >
              Open chat <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-card dark:border-slate-800/80 dark:bg-slate-900 overflow-hidden">
            {loading || !data ? (
              <div className="flex flex-col gap-3 p-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
              </div>
            ) : data.recent_questions.length === 0 ? (
              <div className="p-8 text-center">
                <p className="font-body text-sm text-slate-500 dark:text-slate-400">
                  No questions asked yet.
                </p>
                <Link to="/chat" className="mt-3 inline-block">
                  <Button size="sm" variant="secondary">
                    Ask your first question
                  </Button>
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.recent_questions.map((q) => (
                  <li
                    key={q.id}
                    className="flex flex-col gap-2.5 px-5 py-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-body text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                        "{q.question}"
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <ConfidenceMeter value={q.confidence} />
                      <Link
                        to="/chat"
                        className="font-body text-xs font-medium text-primary hover:underline dark:text-primary-400"
                      >
                        Resume →
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* ── Enterprise Workflow Feature Strip ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800/80 dark:bg-slate-900/60 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
              <Upload className="h-4 w-4" />
            </div>
            <h3 className="font-display text-sm font-bold text-slate-900 dark:text-slate-100">1. Instant Ingestion</h3>
          </div>
          <p className="font-body text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Upload PDFs, DOCX, and TXT files. Pages are automatically parsed, cleaned, and split into semantic chunks.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800/80 dark:bg-slate-900/60 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-100 text-accent-700 dark:bg-accent-950 dark:text-accent-300">
              <Search className="h-4 w-4" />
            </div>
            <h3 className="font-display text-sm font-bold text-slate-900 dark:text-slate-100">2. Vector Search</h3>
          </div>
          <p className="font-body text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            High-dimensional vector embeddings retrieve the top relevant passages with hybrid keyword + semantic scoring.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800/80 dark:bg-slate-900/60 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h3 className="font-display text-sm font-bold text-slate-900 dark:text-slate-100">3. Grounded Synthesis</h3>
          </div>
          <p className="font-body text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            LLM synthesizes direct answers strictly based on retrieved context, appending page citations and confidence scores.
          </p>
        </div>
      </div>
    </div>
  )
}
