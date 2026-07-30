import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CheckCircle2, XCircle, X } from 'lucide-react'

interface Toast {
  id: number
  message: string
  variant: 'success' | 'error'
}

interface ToastContextValue {
  notify: (message: string, variant?: 'success' | 'error') => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const notify = useCallback((message: string, variant: 'success' | 'error' = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, variant }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  function dismiss(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`flex items-center gap-2 rounded-md border px-3.5 py-2.5 pr-2 shadow-lg font-body text-sm
              ${
                t.variant === 'success'
                  ? 'border-signal/30 bg-surface text-ink dark:border-signal-dark/40 dark:bg-surface-dark dark:text-ink-dark'
                  : 'border-flag/30 bg-surface text-ink dark:border-flag-light/40 dark:bg-surface-dark dark:text-ink-dark'
              }`}
          >
            {t.variant === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-signal dark:text-signal-dark" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0 text-flag dark:text-flag-light" />
            )}
            <span>{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="ml-1 rounded p-1 text-ink/40 hover:bg-line/50 hover:text-ink dark:text-ink-dark/40 dark:hover:bg-line-dark/50"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
