import { useEffect, useState } from 'react'
import {
  Users, FileStack, MessageSquare, HardDrive, Trash2, ShieldCheck,
  ShieldAlert, Search, Shield
} from 'lucide-react'
import {
  adminDeleteUser, adminGetAnalytics, adminListUsers, adminToggleUserRole, extractErrorMessage
} from '../lib/api'
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
      className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card transition-all duration-300 hover:shadow-card-hover dark:border-slate-800/80 dark:bg-slate-900 animate-fade-in-up"
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
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-sm`}>
          <Icon className="h-5 w-5" />
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
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  async function refresh() {
    const [a, u] = await Promise.all([adminGetAnalytics(), adminListUsers()])
    setAnalytics(a)
    setUsers(u)
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [])

  async function handleToggleRole(u: AdminUser) {
    if (u.id === currentUser?.id) {
      notify('You cannot change your own admin role.', 'error')
      return
    }
    const newRole = u.is_admin ? 'Standard User' : 'Administrator'
    if (!confirm(`Change ${u.email}'s role to ${newRole}?`)) return
    
    setTogglingId(u.id)
    try {
      const updated = await adminToggleUserRole(u.id)
      setUsers((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
      notify(`Updated ${u.email} to ${newRole}.`)
    } catch (err) {
      notify(extractErrorMessage(err, 'Could not change user role.'), 'error')
    } finally {
      setTogglingId(null)
    }
  }

  async function handleDeleteUser(u: AdminUser) {
    if (u.id === currentUser?.id) return
    if (!confirm(`Delete "${u.email}"? This will permanently delete all their documents and chats.`)) return
    try {
      await adminDeleteUser(u.id)
      notify(`${u.email} deleted successfully.`)
      await refresh()
    } catch (err) {
      notify(extractErrorMessage(err, 'Could not delete user.'), 'error')
    }
  }

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase()
    return (
      u.email.toLowerCase().includes(q) ||
      (u.full_name && u.full_name.toLowerCase().includes(q))
    )
  })

  return (
    <div className="flex flex-col gap-8">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 animate-fade-in-up">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 text-white shadow-sm">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Admin Console
          </h1>
          <p className="mt-0.5 font-body text-sm text-slate-500 dark:text-slate-400">
            Tenant metrics, system health, and workspace account management.
          </p>
        </div>
      </div>

      {/* ── Platform Stat Cards ── */}
      {loading || !analytics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Accounts" value={String(analytics.total_users)} gradient="from-blue-600 to-indigo-600" delay="0ms" />
          <StatCard icon={FileStack} label="Indexed Documents" value={String(analytics.total_documents)} gradient="from-purple-600 to-pink-600" delay="50ms" />
          <StatCard icon={MessageSquare} label="Questions Synthesized" value={String(analytics.total_questions_asked)} gradient="from-emerald-600 to-teal-600" delay="100ms" />
          <StatCard icon={HardDrive} label="Storage Ingested" value={formatBytes(analytics.total_storage_bytes)} gradient="from-amber-500 to-rose-500" delay="150ms" />
        </div>
      )}

      {/* ── User Directory Table ── */}
      <div className="flex flex-col gap-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
              Registered Accounts
            </h2>
            <p className="font-body text-xs text-slate-500 dark:text-slate-400">
              Control workspace access, view tenant activity, and grant administrator permissions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user name or email…"
                className="h-9 w-64 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs font-body text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 shadow-xs"
              />
            </div>
            <Badge tone="neutral">{filteredUsers.length} total</Badge>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card dark:border-slate-800/80 dark:bg-slate-900">
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
                  <tr className="border-b border-slate-100 bg-slate-50/70 font-mono text-[11px] uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-500">
                    <th className="px-6 py-3.5 font-semibold">User</th>
                    <th className="px-6 py-3.5 font-semibold">Documents</th>
                    <th className="px-6 py-3.5 font-semibold">Questions</th>
                    <th className="px-6 py-3.5 font-semibold">Role</th>
                    <th className="px-6 py-3.5 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-body dark:divide-slate-800">
                  {filteredUsers.map((u) => {
                    const initials = u.full_name
                      ? u.full_name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
                      : u.email.slice(0, 2).toUpperCase()

                    return (
                      <tr key={u.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-indigo-600 text-xs font-bold text-white shadow-xs">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{u.full_name || 'Anonymous User'}</p>
                              <p className="font-mono text-xs text-slate-400 dark:text-slate-500">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {u.document_count}
                        </td>
                        <td className="px-6 py-4 font-mono text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {u.question_count}
                        </td>
                        <td className="px-6 py-4">
                          <Badge tone={u.is_admin ? 'warning' : 'neutral'} dot={u.is_admin}>
                            {u.is_admin ? 'Administrator' : 'Standard User'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {u.id !== currentUser?.id ? (
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => handleToggleRole(u)}
                                disabled={togglingId === u.id}
                                className="inline-flex items-center gap-1 rounded-xl border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-100 dark:border-primary-800 dark:bg-primary-950 dark:text-primary-300 dark:hover:bg-primary-900"
                              >
                                {u.is_admin ? (
                                  <>
                                    <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                                    Demote
                                  </>
                                ) : (
                                  <>
                                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                    Make Admin
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => handleDeleteUser(u)}
                                title={`Delete ${u.email}`}
                                className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </button>
                            </div>
                          ) : (
                            <span className="font-mono text-xs text-slate-400 dark:text-slate-500">Current Session</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
