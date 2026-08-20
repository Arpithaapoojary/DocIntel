import { useEffect, useState } from 'react'
import {
  Users, HardDrive, MessageSquare,
  Trash2, RefreshCw
} from 'lucide-react'
import {
  adminDeleteUser, extractErrorMessage,
  adminGetAnalytics, adminListUsers
} from '../lib/api'
import type { AdminAnalytics, AdminUser } from '../types'
import { Badge, Skeleton } from '../components/ui/primitives'
import { Button } from '../components/ui/Button'
import { useToast } from '../contexts/ToastContext'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function AdminPage() {
  const { notify } = useToast()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadData() {
    try {
      const [u, a] = await Promise.all([adminListUsers(), adminGetAnalytics()])
      setUsers(u)
      setAnalytics(a)
    } catch (err) {
      notify(extractErrorMessage(err, 'Failed to load admin telemetry.'), 'error')
    }
  }

  useEffect(() => {
    loadData().finally(() => setLoading(false))
  }, [])

  async function handleDelete(u: AdminUser) {
    if (!confirm(`Delete user ${u.email}? This cascades to all their uploaded documents and chat histories.`)) return
    try {
      await adminDeleteUser(u.id)
      notify(`User ${u.email} deleted.`)
      await loadData()
    } catch (err) {
      notify(extractErrorMessage(err, 'Could not delete user.'), 'error')
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Admin Console
            </h1>
            <Badge tone="warning">Admin Clearance</Badge>
          </div>
          <p className="mt-1.5 font-sans text-sm sm:text-base text-slate-500 dark:text-slate-400">
            Tenant provisioning, user management, and platform analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={loadData} className="gap-1.5">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Analytics KPI Tiles */}
      {loading || !analytics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase font-semibold text-slate-500">Registered Users</span>
              <Users className="h-5 w-5 text-slate-400" />
            </div>
            <p className="mt-3 font-display text-3xl font-bold text-slate-900 dark:text-slate-100">{analytics.total_users}</p>
            <p className="mt-1 font-mono text-xs text-slate-500">Active accounts</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase font-semibold text-slate-500">Platform Docs</span>
              <HardDrive className="h-5 w-5 text-slate-400" />
            </div>
            <p className="mt-3 font-display text-3xl font-bold text-slate-900 dark:text-slate-100">{analytics.total_documents}</p>
            <p className="mt-1 font-mono text-xs text-slate-500">All users combined</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase font-semibold text-slate-500">Total Inquiries</span>
              <MessageSquare className="h-5 w-5 text-slate-400" />
            </div>
            <p className="mt-3 font-display text-3xl font-bold text-slate-900 dark:text-slate-100">{analytics.total_questions_asked}</p>
            <p className="mt-1 font-mono text-xs text-slate-500">Grounded chat queries</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase font-semibold text-slate-500">Global Storage</span>
              <HardDrive className="h-5 w-5 text-slate-400" />
            </div>
            <p className="mt-3 font-display text-3xl font-bold text-slate-900 dark:text-slate-100">{formatBytes(analytics.total_storage_bytes)}</p>
            <p className="mt-1 font-mono text-xs text-slate-500">Disk payload</p>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="flex flex-col gap-4">
        <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
          User Management ({users.length})
        </h2>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 font-mono text-xs uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                    <th className="px-5 py-3.5 font-semibold">User</th>
                    <th className="px-5 py-3.5 font-semibold">Role</th>
                    <th className="px-5 py-3.5 font-semibold">Docs</th>
                    <th className="px-5 py-3.5 font-semibold">Inquiries</th>
                    <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans dark:divide-slate-800">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{u.full_name || u.email}</p>
                          <p className="font-mono text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge tone={u.is_admin ? 'warning' : 'neutral'} dot={u.is_admin}>
                          {u.is_admin ? 'Primary Admin' : 'Member'}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 font-mono text-slate-600 dark:text-slate-400">
                        {u.document_count}
                      </td>
                      <td className="px-5 py-4 font-mono text-slate-600 dark:text-slate-400">
                        {u.question_count}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          {!u.is_admin && (
                            <button
                              onClick={() => handleDelete(u)}
                              title="Delete User"
                              className="rounded p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
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
    </div>
  )
}
