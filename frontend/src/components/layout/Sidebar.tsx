import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, FileStack, MessageSquare, Search,
  ShieldCheck, LogOut, Moon, Sun, Sparkles
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useEffect, useState } from 'react'

const navItems = [
  { to: '/',          label: 'Dashboard',  icon: LayoutDashboard, end: true, badge: null   },
  { to: '/documents', label: 'Documents',  icon: FileStack,                  badge: null   },
  { to: '/chat',      label: 'Ask AI',     icon: MessageSquare,              badge: 'AI'   },
  { to: '/search',    label: 'Deep Search',icon: Search,                     badge: null   },
]

export function Sidebar() {
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
    <aside className="relative flex h-screen w-64 shrink-0 flex-col border-r border-slate-200/90 bg-white/95 backdrop-blur-md dark:border-slate-800/90 dark:bg-slate-950/95 overflow-hidden select-none">
      {/* Ambient glow backgrounds */}
      <div className="pointer-events-none absolute -top-16 -left-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15" />
      <div className="pointer-events-none absolute bottom-12 -right-12 h-40 w-40 rounded-full bg-accent/10 blur-3xl dark:bg-accent/15" />

      {/* ── Brand Header ── */}
      <div className="relative flex items-center justify-between border-b border-slate-200/80 px-5 py-4 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 via-indigo-600 to-accent shadow-glow-sm">
            <Sparkles className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                DocIntel
              </span>
              <span className="rounded-md bg-primary-100 px-1.5 py-0.2 font-mono text-[9px] font-bold text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                PRO
              </span>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Document Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* ── Navigation Links ── */}
      <div className="px-3 pt-4 pb-2">
        <p className="px-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Navigation
        </p>
      </div>

      <nav className="relative flex flex-1 flex-col gap-1 px-3">
        {navItems.map(({ to, label, icon: Icon, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-body text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-primary-50 to-indigo-50/50 text-primary-700 font-semibold shadow-xs dark:from-primary-950/60 dark:to-indigo-950/30 dark:text-primary-300'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-500 text-white shadow-glow-sm'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:group-hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span>{label}</span>
                {badge && (
                  <span className="ml-auto rounded-full bg-gradient-to-r from-primary-500 to-accent px-2 py-0.5 font-mono text-[9px] font-bold text-white shadow-xs">
                    {badge}
                  </span>
                )}
                {isActive && !badge && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-600 dark:bg-primary-400" />
                )}
              </>
            )}
          </NavLink>
        ))}

        {user?.is_admin && (
          <>
            <div className="px-3 pt-4 pb-2">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Administration
              </p>
            </div>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-body text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-amber-50 text-amber-800 font-semibold dark:bg-amber-950/50 dark:text-amber-300'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-amber-100 group-hover:text-amber-700 dark:bg-slate-900 dark:text-slate-400 dark:group-hover:bg-amber-950/60 dark:group-hover:text-amber-300'
                    }`}
                  >
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <span>Admin Console</span>
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-500" />
                  )}
                </>
              )}
            </NavLink>
          </>
        )}

        {/* Engine Status Indicator Card */}
        <div className="mt-auto px-1 py-3">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800/80 dark:bg-slate-900/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-[10px] font-semibold text-slate-700 dark:text-slate-300">RAG Engine</span>
              </div>
              <span className="font-mono text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">Active</span>
            </div>
            <p className="mt-1 font-body text-[11px] text-slate-500 dark:text-slate-400">
              Vector index grounded & ready
            </p>
          </div>
        </div>
      </nav>

      {/* ── Footer / User Profile ── */}
      <div className="relative border-t border-slate-200/80 p-3 dark:border-slate-800/80 space-y-1.5">
        {/* Dark Mode Switch */}
        <button
          onClick={() => setDark((d) => !d)}
          className="flex w-full items-center justify-between rounded-xl px-3 py-2 font-body text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            {dark ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-slate-500" />}
            <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400 dark:text-slate-600">
            {dark ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* User Card */}
        <div className="flex items-center gap-3 rounded-xl bg-slate-100/80 px-3 py-2 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/50">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-accent text-xs font-bold text-white shadow-xs">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-body text-xs font-semibold text-slate-900 dark:text-slate-100">
              {user?.full_name || user?.email}
            </p>
            <p className="truncate font-mono text-[10px] text-slate-400 dark:text-slate-500">
              {user?.is_admin ? 'Admin' : 'Member'}
            </p>
          </div>
          <button
            onClick={logout}
            aria-label="Log out"
            title="Log out"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-950/50 dark:hover:text-red-400 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
