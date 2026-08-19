import type { ReactNode } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Search, Sparkles, Shield, Database } from 'lucide-react'

const routeTitles: Record<string, { title: string; subtitle: string; icon: typeof Sparkles }> = {
  '/':          { title: 'Overview',      subtitle: 'Analytics & Recent Activity', icon: Sparkles },
  '/documents': { title: 'Document Vault', subtitle: 'Manage & Index Knowledge',    icon: Database },
  '/chat':      { title: 'Ask Assistant',  subtitle: 'Grounded AI Q&A Engine',      icon: Sparkles },
  '/search':    { title: 'Vector Search',  subtitle: 'Hybrid Semantic & Keyword',   icon: Search },
  '/admin':     { title: 'Admin Console',  subtitle: 'Tenant & User Management',    icon: Shield },
}

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const currentRoute = routeTitles[location.pathname] || { title: 'Workspace', subtitle: 'DocIntel Platform', icon: Sparkles }
  const HeaderIcon = currentRoute.icon

  return (
    <div className="flex h-screen w-full bg-paper dark:bg-paper-dark overflow-hidden font-body text-ink dark:text-ink-dark">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area with Topbar Header */}
      <div className="flex flex-1 flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar Header */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/80 px-8 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80">
          {/* Breadcrumb & Section Info */}
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 text-primary dark:bg-primary-950/60 dark:text-primary-300">
              <HeaderIcon className="h-3.5 w-3.5" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-sm font-bold text-slate-900 dark:text-slate-100">
                {currentRoute.title}
              </span>
              <span className="hidden sm:inline font-body text-xs text-slate-400 dark:text-slate-500">
                — {currentRoute.subtitle}
              </span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/search"
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500 hover:border-primary/40 hover:bg-slate-100 hover:text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Search className="h-3 w-3" />
              <span className="hidden md:inline">Quick Search</span>
              <kbd className="ml-1 rounded bg-slate-200/70 px-1 py-0.2 font-mono text-[9px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                /
              </kbd>
            </Link>

            <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Grounded</span>
            </div>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50/50 dark:bg-slate-950/40">
          <div className="mx-auto max-w-6xl px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
