import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FileStack, MessageSquare, Search, ShieldCheck, LogOut, Moon, Sun } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useEffect, useState } from 'react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/documents', label: 'Documents', icon: FileStack },
  { to: '/chat', label: 'Ask', icon: MessageSquare },
  { to: '/search', label: 'Search', icon: Search },
]

export function Sidebar() {
  const { user, logout } = useAuth()
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-line bg-surface dark:border-line-dark dark:bg-surface-dark">
      <div className="flex items-center gap-2 border-b border-line px-5 py-5 dark:border-line-dark">
        <div className="citation-tab px-2 py-1 font-display text-sm font-semibold">DI</div>
        <div>
          <p className="font-display text-sm font-semibold leading-tight text-ink dark:text-ink-dark">
            DocIntel
          </p>
          <p className="font-mono text-[10px] uppercase tracking-wide text-ink/40 dark:text-ink-dark/40">
            Document Intelligence
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-md px-3 py-2 font-body text-sm transition-colors ${
                isActive
                  ? 'bg-signal/10 text-signal dark:bg-signal-dark/15 dark:text-signal-dark'
                  : 'text-ink/70 hover:bg-paper hover:text-ink dark:text-ink-dark/70 dark:hover:bg-paper-dark dark:hover:text-ink-dark'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}

        {user?.is_admin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-md px-3 py-2 font-body text-sm transition-colors ${
                isActive
                  ? 'bg-flag/10 text-flag dark:bg-flag-light/15 dark:text-flag-light'
                  : 'text-ink/70 hover:bg-paper hover:text-ink dark:text-ink-dark/70 dark:hover:bg-paper-dark dark:hover:text-ink-dark'
              }`
            }
          >
            <ShieldCheck className="h-4 w-4" />
            Admin
          </NavLink>
        )}
      </nav>

      <div className="border-t border-line px-3 py-3 dark:border-line-dark">
        <button
          onClick={() => setDark((d) => !d)}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 font-body text-sm text-ink/70 hover:bg-paper hover:text-ink dark:text-ink-dark/70 dark:hover:bg-paper-dark dark:hover:text-ink-dark"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {dark ? 'Light mode' : 'Dark mode'}
        </button>
        <div className="mt-1 flex items-center justify-between px-3 py-2">
          <div className="min-w-0">
            <p className="truncate font-body text-sm text-ink dark:text-ink-dark">
              {user?.full_name || user?.email}
            </p>
            <p className="truncate font-mono text-[11px] text-ink/40 dark:text-ink-dark/40">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            aria-label="Log out"
            className="shrink-0 rounded-md p-1.5 text-ink/50 hover:bg-flag/10 hover:text-flag dark:text-ink-dark/50 dark:hover:bg-flag-light/10 dark:hover:text-flag-light"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
