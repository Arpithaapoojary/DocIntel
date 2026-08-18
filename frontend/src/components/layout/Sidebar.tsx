import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, FileStack, MessageSquare, Search,
  ShieldCheck, LogOut, Moon, Sun, Zap,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useEffect, useState } from 'react'

const navItems = [
  { to: '/',          label: 'Dashboard', icon: LayoutDashboard, end: true  },
  { to: '/documents', label: 'Documents', icon: FileStack                   },
  { to: '/chat',      label: 'Ask',       icon: MessageSquare               },
  { to: '/search',    label: 'Search',    icon: Search                      },
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
    <aside className="relative flex h-screen w-64 shrink-0 flex-col border-r border-line/60 bg-surface dark:border-line-dark dark:bg-surface-dark overflow-hidden">
      {/* Subtle gradient background accent */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl dark:bg-primary/10" />
      <div className="pointer-events-none absolute bottom-0 -right-10 h-48 w-48 rounded-full bg-accent/5 blur-3xl dark:bg-accent/8" />

      {/* ── Logo ── */}
      <div className="relative flex items-center gap-3 border-b border-line/60 px-5 py-5 dark:border-line-dark">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-glow-sm">
          <Zap className="h-4 w-4 text-white" fill="white" />
        </div>
        <div>
          <p className="font-display text-sm font-bold leading-tight text-ink dark:text-ink-dark tracking-tight">
            DocIntel
          </p>
          <p className="font-mono text-[9px] uppercase tracking-widest text-ink/40 dark:text-ink-dark/40">
            AI · Document Intelligence
          </p>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="relative flex flex-1 flex-col gap-1 px-3 py-4">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-body text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary/10 text-primary shadow-glow-sm dark:bg-primary/15 dark:text-primary-300'
                  : 'text-ink/60 hover:bg-primary/5 hover:text-ink dark:text-ink-dark/60 dark:hover:bg-primary/8 dark:hover:text-ink-dark'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/15 text-primary dark:bg-primary/20 dark:text-primary-300'
                      : 'bg-transparent text-ink/40 group-hover:bg-primary/8 group-hover:text-primary/70 dark:text-ink-dark/40'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                {label}
                {isActive && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary dark:bg-primary-300" />
                )}
              </>
            )}
          </NavLink>
        ))}

        {user?.is_admin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-body text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-warning/10 text-warning dark:bg-warning-dark/15 dark:text-warning-dark'
                  : 'text-ink/60 hover:bg-warning/5 hover:text-warning dark:text-ink-dark/60 dark:hover:bg-warning/8 dark:hover:text-warning-dark'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-warning/15 text-warning'
                      : 'bg-transparent text-ink/40 group-hover:bg-warning/8 group-hover:text-warning/70'
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                </span>
                Admin
                {isActive && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-warning" />
                )}
              </>
            )}
          </NavLink>
        )}

        {/* Divider */}
        <div className="mx-2 mt-auto pt-4">
          <div className="border-t border-line/60 dark:border-line-dark" />
        </div>
      </nav>

      {/* ── Bottom actions ── */}
      <div className="relative px-3 pb-4 pt-1 space-y-1">
        {/* Dark mode toggle */}
        <button
          onClick={() => setDark((d) => !d)}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 font-body text-sm text-ink/60 hover:bg-primary/5 hover:text-ink dark:text-ink-dark/60 dark:hover:bg-primary/8 dark:hover:text-ink-dark transition-all duration-200"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-transparent text-ink/40 dark:text-ink-dark/40">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </span>
          {dark ? 'Light mode' : 'Dark mode'}
        </button>

        {/* User row */}
        <div className="flex items-center gap-3 rounded-xl bg-primary/5 px-3.5 py-2.5 dark:bg-primary/8">
          {/* Avatar */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-xs font-bold text-white shadow-glow-sm">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-body text-sm font-medium text-ink dark:text-ink-dark">
              {user?.full_name || user?.email}
            </p>
            {user?.full_name && (
              <p className="truncate font-mono text-[10px] text-ink/40 dark:text-ink-dark/40">
                {user?.email}
              </p>
            )}
          </div>
          <button
            onClick={logout}
            aria-label="Log out"
            className="shrink-0 rounded-lg p-1.5 text-ink/40 hover:bg-danger/10 hover:text-danger dark:text-ink-dark/40 dark:hover:bg-danger/15 dark:hover:text-danger-dark transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
