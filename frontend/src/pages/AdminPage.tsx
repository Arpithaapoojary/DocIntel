import { useEffect, useState } from 'react'
import {
  Users, FileStack, MessageSquare, HardDrive, Trash2, ShieldCheck,
  ShieldAlert, Search
} from 'lucide-react'
import {
  adminDeleteUser, adminGetAnalytics, adminListUsers, adminToggleUserRole, extractErrorMessage
} from '../lib/api'
import type { AdminAnalytics, AdminUser } from '../types'
import { Skeleton, Badge } from '../components/ui/primitives'
import { Button } from '../components/ui/Button'
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
  secondary: string
}

function StatCard({ icon: Icon, label, value, secondary }: AdminStatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
          {label}
        </span>
        <Icon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
      </div>
      <p className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-slate-100">
        {value}
      </p>
      <p className="mt-1 font-mono text-[11px] text-slate-500 dark:text-slate-400">
        {secondary}
      </p>
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
      notify('You cannot modify your own administrator role.', 'error')
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
    if (!confirm(`Delete "${u.email}"? This will permanently remove their documents and chats.`)) return
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
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 dark:border-slate-800">
        <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
          Admin Console
        </h1>
        <p className="mt-1 font-sans text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Workspace tenant metrics, database storage, and account privileges.
        </p>
      </div>

      {/* Platform Analytics Cards */}
      {loading || !analytics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Accounts" value={String(analytics.total_users)} secondary="Registered users" />
          <StatCard icon={FileStack} label="Indexed Documents" value={String(analytics.total_documents)} secondary="Stored in vault" />
          <StatCard icon={MessageSquare} label="Questions Asked" value={String(analytics.total_questions_asked)} secondary="Grounded queries" />
          <StatCard icon={HardDrive} label="Total Storage" value={formatBytes(analytics.total_storage_bytes)} secondary="Database & vectors" />
        </div>
      )}

      {/* User Directory Table */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-sm font-bold text-slate-900 dark:text-slate-100">
              User Accounts
            </h2>
            <p className="font-sans text-xs text-slate-500 dark:text-slate-400">
              Manage workspace access and administrator privileges.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name or email…"
                className="h-8.5 w-56 rounded-lg border border-slate-200 bg-white pl-8 pr-3 font-sans text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 shadow-xs"
              />
            </div>
            <Badge tone="neutral">{filteredUsers.length} total</Badge>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          {loading ? (
            <div className="flex flex-col gap-2 p-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                    <th className="px-4 py-3 font-semibold">User</th>
                    <th className="px-4 py-3 font-semibold">Documents</th>
                    <th className="px-4 py-3 font-semibold">Questions</th>
                    <th className="px-4 py-3 font-semibold">Role</th>
                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans dark:divide-slate-800">
                  {filteredUsers.map((u) => {
                    const initials = u.full_name
                      ? u.full_name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
                      : u.email.slice(0, 2).toUpperCase()

                    return (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-800 text-xs font-semibold text-white dark:bg-slate-700">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 dark:text-slate-100">{u.full_name || 'Anonymous'}</p>
                              <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                          {u.document_count}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                          {u.question_count}
                        </td>
                        <td className="px-4 py-3">
                          <Badge tone={u.is_admin ? 'warning' : 'neutral'} dot={u.is_admin}>
                            {u.is_admin ? 'Administrator' : 'Standard User'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {u.id !== currentUser?.id ? (
                            <div className="inline-flex items-center gap-2">
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => handleToggleRole(u)}
                                disabled={togglingId === u.id}
                              >
                                {u.is_admin ? (
                                  <>
                                    <ShieldAlert className="h-3 w-3 text-amber-500" />
                                    Demote
                                  </>
                                ) : (
                                  <>
                                    <ShieldCheck className="h-3 w-3 text-emerald-500" />
                                    Make Admin
                                  </>
                                )}
                              </Button>

                              <button
                                onClick={() => handleDeleteUser(u)}
                                title={`Delete ${u.email}`}
                                className="rounded p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="font-mono text-[10px] text-slate-400">Current Session</span>
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
