import { useEffect, useState } from 'react'
import { Users, FileStack, MessageSquare, HardDrive, Trash2, ShieldCheck } from 'lucide-react'
import { adminDeleteUser, adminGetAnalytics, adminListUsers, extractErrorMessage } from '../lib/api'
import type { AdminAnalytics, AdminUser } from '../types'
import { Card, Skeleton, Badge } from '../components/ui/primitives'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-flag/10 text-flag dark:bg-flag-light/15 dark:text-flag-light">
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
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-flag dark:text-flag-light" />
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink dark:text-ink-dark">Admin</h1>
          <p className="mt-1 font-body text-sm text-ink/60 dark:text-ink-dark/60">
            Platform-wide analytics and user management.
          </p>
        </div>
      </div>

      {loading || !analytics ? (
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          <StatCard icon={Users} label="Users" value={String(analytics.total_users)} />
          <StatCard icon={FileStack} label="Documents" value={String(analytics.total_documents)} />
          <StatCard icon={MessageSquare} label="Questions Asked" value={String(analytics.total_questions_asked)} />
          <StatCard icon={HardDrive} label="Storage Used" value={formatBytes(analytics.total_storage_bytes)} />
        </div>
      )}

      <div>
        <h2 className="mb-3 font-display text-base font-semibold text-ink dark:text-ink-dark">Users</h2>
        <Card>
          {loading ? (
            <div className="flex flex-col gap-3 p-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-line font-mono text-[11px] uppercase tracking-wide text-ink/40 dark:border-line-dark dark:text-ink-dark/40">
                  <th className="px-4 py-2.5 font-normal">User</th>
                  <th className="px-4 py-2.5 font-normal">Documents</th>
                  <th className="px-4 py-2.5 font-normal">Questions</th>
                  <th className="px-4 py-2.5 font-normal">Role</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line dark:divide-line-dark">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3">
                      <p className="font-body text-sm text-ink dark:text-ink-dark">{u.full_name || u.email}</p>
                      <p className="font-mono text-[11px] text-ink/40 dark:text-ink-dark/40">{u.email}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-ink/70 dark:text-ink-dark/70">
                      {u.document_count}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-ink/70 dark:text-ink-dark/70">
                      {u.question_count}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={u.is_admin ? 'warning' : 'neutral'}>{u.is_admin ? 'Admin' : 'User'}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.id !== currentUser?.id && (
                        <button
                          onClick={() => handleDeleteUser(u)}
                          aria-label={`Delete ${u.email}`}
                          className="rounded-md p-1.5 text-ink/40 hover:bg-flag/10 hover:text-flag dark:text-ink-dark/40 dark:hover:bg-flag-light/10 dark:hover:text-flag-light"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  )
}
