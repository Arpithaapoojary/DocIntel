import { useState, type ReactNode } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Search, Menu } from 'lucide-react'

const routeTitles: Record<string, { title: string; subtitle: string }> = {
  '/':          { title: 'Dashboard',      subtitle: 'Overview & Document Stats' },
  '/documents': { title: 'Documents',      subtitle: 'Knowledge Ingestion & Indexing' },
  '/chat':      { title: 'Assistant',      subtitle: 'Grounded Q&A Synthesis' },
  '/search':    { title: 'Deep Search',    subtitle: 'Vector & Keyword Passage Retrieval' },
  '/admin':     { title: 'Admin Console',  subtitle: 'Tenant & User Management' },
}

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const currentRoute = routeTitles[location.pathname] || { title: 'Workspace', subtitle: 'DocIntel Platform' }

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans text-slate-900 dark:text-slate-100">
      {/* Responsive Sidebar */}
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar Header */}
        <header className="flex h-15 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8 dark:border-slate-800 dark:bg-slate-900">
          {/* Left: Mobile hamburger + Breadcrumbs */}
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-baseline gap-2.5">
              <span className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                {currentRoute.title}
              </span>
              <span className="hidden sm:inline font-sans text-xs sm:text-sm text-slate-400 dark:text-slate-500">
                / {currentRoute.subtitle}
              </span>
            </div>
          </div>

          {/* Right: Quick actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/search"
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden sm:inline rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                /
              </kbd>
            </Link>

            <div className="flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-mono text-xs font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Grounded</span>
            </div>
          </div>
        </header>

        {/* Scrollable Main Body */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-5 sm:p-8 lg:p-10">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
