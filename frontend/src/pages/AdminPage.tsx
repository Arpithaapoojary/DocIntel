import { useEffect, useState } from 'react'
import { Users, FileStack, MessageSquare, HardDrive, Trash2, ShieldCheck } from 'lucide-react'
import { adminDeleteUser, adminGetAnalytics, adminListUsers, extractErrorMessage } from '../lib/api'
import type { AdminAnalytics, AdminUser } from '../types'
import { Skeleton, Badge } from '../components/ui/primitives'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface AdminStatCardProps {
  icon: typeof Users
  label: string
  value: string
  gradient: string
  delay?: string
}

function StatCard({ icon: Icon, label, value, gradient, delay = '0ms' }: AdminStatCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-line/60 bg-surface p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 dark:border-line-dark dark:bg-surface-dark dark:shadow-card-dark animate-fade-in-up"
      style={{ animationDelay: delay }}
    >
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

export function AdminPage() {
  const { user: currentUser } = useAuth()
  const { notify } = useToast()
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  async function refresh() {
    const [a, u] = await Promise.all([adminGetAnalytics(), adminListUsers()])
    setAnalytics(a)
    setUsers(u)
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [])

  async function handleDeleteUser(u: AdminUser) {
    if (u.id === currentUser?.id) return
    if (!confirm(`Delete "${u.email}"? This removes all their documents and chat history too.`)) return
    try {
      await adminDeleteUser(u.id)
      notify(`${u.email} deleted.`)
      await refresh()
    } catch (err) {
      notify(extractErrorMessage(err, 'Could not delete user.'), 'error')
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 animate-fade-in-up">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-flag to-amber-600 shadow-sm">
          <ShieldCheck className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink dark:text-ink-dark">
            Admin Console
          </h1>
          <p className="mt-0.5 font-body text-sm text-ink/60 dark:text-ink-dark/60">
            Platform-wide analytics, tenant stats, and user account management.
          </p>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      {loading || !analytics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Users" value={String(analytics.total_users)} gradient="from-blue-600 to-indigo-600" delay="0ms" />
          <StatCard icon={FileStack} label="Indexed Documents" value={String(analytics.total_documents)} gradient="from-purple-600 to-pink-600" delay="50ms" />
          <StatCard icon={MessageSquare} label="Queries Processed" value={String(analytics.total_questions_asked)} gradient="from-emerald-600 to-teal-600" delay="100ms" />
          <StatCard icon={HardDrive} label="Storage Consumed" value={formatBytes(analytics.total_storage_bytes)} gradient="from-amber-500 to-rose-500" delay="150ms" />
        </div>
      )}

      {/* ── User Table ── */}
      <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-ink dark:text-ink-dark">Registered Users</h2>
            <p className="font-body text-xs text-ink/50 dark:text-ink-dark/50">
              Manage accounts and access permissions across DocIntel.
            </p>
          </div>
          <Badge tone="neutral">{users.length} {users.length === 1 ? 'account' : 'accounts'}</Badge>
        </div>

        <div className="overflow-hidden rounded-2xl border border-line/60 bg-surface shadow-card dark:border-line-dark dark:bg-surface-dark">
          {loading ? (
            <div className="flex flex-col gap-3 p-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-line/60 bg-surface-hover/30 font-mono text-[11px] uppercase tracking-widest text-ink/40 dark:border-line-dark dark:bg-surface-dark-hover/30 dark:text-ink-dark/40">
                    <th className="px-6 py-3.5 font-medium">User</th>
                    <th className="px-6 py-3.5 font-medium">Documents</th>
                    <th className="px-6 py-3.5 font-medium">Questions</th>
                    <th className="px-6 py-3.5 font-medium">Role</th>
                    <th className="px-6 py-3.5 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/40 font-body dark:divide-line-dark/40">
                  {users.map((u) => (
                    <tr key={u.id} className="transition-colors hover:bg-surface-hover/50 dark:hover:bg-surface-dark-hover/50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-sm text-ink dark:text-ink-dark">{u.full_name || u.email}</p>
                        <p className="font-mono text-xs text-ink/40 dark:text-ink-dark/40">{u.email}</p>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-ink/70 dark:text-ink-dark/70">
                        {u.document_count}
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-ink/70 dark:text-ink-dark/70">
                        {u.question_count}
                      </td>
                      <td className="px-6 py-4">
                        <Badge tone={u.is_admin ? 'warning' : 'neutral'}>{u.is_admin ? 'Administrator' : 'Standard User'}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {u.id !== currentUser?.id ? (
                          <button
                            onClick={() => handleDeleteUser(u)}
                            aria-label={`Delete ${u.email}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-500/10 dark:border-red-400/20 dark:text-red-400 dark:hover:bg-red-400/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        ) : (
                          <span className="font-mono text-xs text-ink/30 dark:text-ink-dark/30">Current Account</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
