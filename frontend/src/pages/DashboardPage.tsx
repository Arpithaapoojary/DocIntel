import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileStack, MessageSquare, HardDrive, Clock, ArrowRight,
  Upload, Search, ShieldCheck, Database
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
  secondary: string
}

function StatCard({ icon: Icon, label, value, secondary }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
          {label}
        </span>
        <Icon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
      </div>
      <p className="mt-3 font-display text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
        {value}
      </p>
      <p className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">
        {secondary}
      </p>
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

  const displayName = user?.full_name ? user.full_name.split(' ')[0] : 'Workspace Member'

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Welcome back, {displayName}
          </h1>
          <p className="mt-1.5 font-sans text-sm sm:text-base text-slate-500 dark:text-slate-400">
            Document knowledge vault and grounded vector assistant overview.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/documents">
            <Button variant="secondary" size="md" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Document
            </Button>
          </Link>
          <Link to="/chat">
            <Button variant="primary" size="md" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Ask Assistant
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Stat Cards */}
      {loading || !data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            icon={FileStack}
            label="Indexed Documents"
            value={String(data.total_documents)}
            secondary="Vector chunked & embedded"
          />
          <StatCard
            icon={MessageSquare}
            label="Queries Answered"
            value={String(data.total_questions_asked)}
            secondary="Grounded citations verified"
          />
          <StatCard
            icon={HardDrive}
            label="Vault Storage"
            value={formatBytes(data.storage_used_bytes)}
            secondary="Local SQLite & Vector store"
          />
          <StatCard
            icon={Database}
            label="RAG Architecture"
            value="Hybrid Dense"
            secondary="FAISS embeddings active"
          />
        </div>
      )}

      {/* 2-Column Activity Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Documents Card */}
        <div className="flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileStack className="h-5 w-5 text-slate-500" />
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                Recent Documents
              </h2>
            </div>
            <Link
              to="/documents"
              className="flex items-center gap-1.5 font-sans text-xs sm:text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              View all ({data?.total_documents ?? 0}) <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            {loading || !data ? (
              <div className="flex flex-col gap-3 p-5">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
              </div>
            ) : data.recent_documents.length === 0 ? (
              <div className="p-10 text-center">
                <p className="font-sans text-sm text-slate-500 dark:text-slate-400">
                  No documents uploaded to this workspace yet.
                </p>
                <Link to="/documents" className="mt-4 inline-block">
                  <Button size="sm" variant="secondary">
                    Upload your first file
                  </Button>
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.recent_documents.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
                        <FileStack className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-sans text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {doc.original_filename}
                        </p>
                        <p className="font-mono text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {doc.page_count} {doc.page_count === 1 ? 'page' : 'pages'} · {doc.chunk_count} chunks
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <Badge
                        tone={doc.status === 'ready' ? 'success' : doc.status === 'failed' ? 'danger' : 'neutral'}
                        dot={doc.status === 'ready'}
                      >
                        {doc.status}
                      </Badge>
                      <Link
                        to="/chat"
                        className="rounded p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
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

        {/* Recent Inquiries Card */}
        <div className="flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-slate-500" />
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                Recent Inquiries
              </h2>
            </div>
            <Link
              to="/chat"
              className="flex items-center gap-1.5 font-sans text-xs sm:text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              Open assistant <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            {loading || !data ? (
              <div className="flex flex-col gap-3 p-5">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
              </div>
            ) : data.recent_questions.length === 0 ? (
              <div className="p-10 text-center">
                <p className="font-sans text-sm text-slate-500 dark:text-slate-400">
                  No questions asked yet.
                </p>
                <Link to="/chat" className="mt-4 inline-block">
                  <Button size="sm" variant="secondary">
                    Start a conversation
                  </Button>
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.recent_questions.map((q) => (
                  <li
                    key={q.id}
                    className="flex flex-col gap-2.5 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-sans text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-1">
                        "{q.question}"
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <ConfidenceMeter value={q.confidence} />
                      <Link
                        to="/chat"
                        className="font-sans text-xs sm:text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
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

      {/* Production Architecture Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2.5 mb-2">
            <Upload className="h-4.5 w-4.5 text-slate-500" />
            <h3 className="font-display text-sm font-bold text-slate-900 dark:text-slate-100">1. Document Parsing</h3>
          </div>
          <p className="font-sans text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            PDF, DOCX, and TXT files are processed, cleaned, and partitioned into semantically coherent vector chunks.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2.5 mb-2">
            <Search className="h-4.5 w-4.5 text-slate-500" />
            <h3 className="font-display text-sm font-bold text-slate-900 dark:text-slate-100">2. Vector Search</h3>
          </div>
          <p className="font-sans text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            High-dimensional embeddings index chunks for dense semantic similarity retrieval and exact keyword filtering.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2.5 mb-2">
            <ShieldCheck className="h-4.5 w-4.5 text-slate-500" />
            <h3 className="font-display text-sm font-bold text-slate-900 dark:text-slate-100">3. Grounded Synthesis</h3>
          </div>
          <p className="font-sans text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            LLM synthesizes responses constrained strictly by retrieved passage context with verified page citations.
          </p>
        </div>
      </div>
    </div>
  )
}
