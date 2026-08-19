import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, FileStack, MessageSquare, Search,
  ShieldCheck, LogOut, Moon, Sun, Layers, X
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useEffect, useState } from 'react'

const navItems = [
  { to: '/',          label: 'Dashboard',   icon: LayoutDashboard, end: true },
  { to: '/documents', label: 'Documents',   icon: FileStack },
  { to: '/chat',      label: 'Assistant',   icon: MessageSquare },
  { to: '/search',    label: 'Deep Search', icon: Search },
]

interface SidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuth()
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const initials = user?.full_name
    ? user.full_name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? 'DI'

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Workspace Brand Header */}
        <div className="flex h-15 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-brand-600">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <span className="font-display text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
                DocIntel
              </span>
              <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                PRO
              </span>
            </div>
          </div>

          {/* Close button for mobile */}
          {onMobileClose && (
            <button
              onClick={onMobileClose}
              className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 lg:hidden"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation Section Header */}
        <div className="px-4 pt-4 pb-1">
          <p className="px-2 font-mono text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Workspace
          </p>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onMobileClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 font-sans text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-slate-50'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                }`
              }
            >
              <Icon className="h-4.5 w-4.5 shrink-0 text-slate-500 dark:text-slate-400" />
              <span>{label}</span>
            </NavLink>
          ))}

          {user?.is_admin && (
            <>
              <div className="px-4 pt-5 pb-1">
                <p className="px-2 font-mono text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Management
                </p>
              </div>
              <NavLink
                to="/admin"
                onClick={onMobileClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 font-sans text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-slate-50'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                  }`
                }
              >
                <ShieldCheck className="h-4.5 w-4.5 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>Admin Console</span>
              </NavLink>
            </>
          )}

          {/* Engine Status */}
          <div className="mt-auto px-2 py-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">RAG Engine</span>
                <span className="inline-flex items-center gap-1.5 font-mono text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>
            </div>
          </div>
        </nav>

        {/* Footer & User Card */}
        <div className="border-t border-slate-200 p-3 dark:border-slate-800 space-y-2">
          {/* Theme switch */}
          <button
            onClick={() => setDark((d) => !d)}
            className="flex w-full items-center justify-between rounded-md px-3 py-2 font-sans text-xs sm:text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              {dark ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-slate-500" />}
              <span>{dark ? 'Light Theme' : 'Dark Theme'}</span>
            </div>
          </button>

          {/* User profile card */}
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-2.5 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-800 text-xs font-semibold text-white dark:bg-slate-700">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-sans text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                {user?.full_name || user?.email}
              </p>
              <p className="truncate font-mono text-xs text-slate-500 dark:text-slate-400">
                {user?.is_admin ? 'Administrator' : 'Member'}
              </p>
            </div>
            <button
              onClick={logout}
              aria-label="Sign out"
              title="Sign out"
              className="rounded p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
