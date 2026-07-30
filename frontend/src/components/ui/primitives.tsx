import type { InputHTMLAttributes, LabelHTMLAttributes, ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-lg border border-line bg-surface dark:border-line-dark dark:bg-surface-dark ${className}`}
    >
      {children}
    </div>
  )
}

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function Field({ label, error, id, className = '', ...rest }: FieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="font-body text-sm font-medium text-ink dark:text-ink-dark">
        {label}
      </label>
      <input
        id={fieldId}
        className={`rounded-md border border-line bg-paper px-3 py-2 font-body text-sm text-ink
          placeholder:text-ink/40 focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal
          dark:border-line-dark dark:bg-paper-dark dark:text-ink-dark dark:placeholder:text-ink-dark/40 ${className}`}
        {...rest}
      />
      {error && <span className="font-body text-xs text-flag dark:text-flag-light">{error}</span>}
    </div>
  )
}

export function LabelText({ children, ...rest }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className="font-body text-sm font-medium text-ink dark:text-ink-dark" {...rest}>
      {children}
    </label>
  )
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'success' | 'warning' | 'danger'
}) {
  const toneClasses: Record<string, string> = {
    neutral: 'bg-line/50 text-ink/70 dark:bg-line-dark/50 dark:text-ink-dark/70',
    success: 'bg-signal/10 text-signal dark:bg-signal-dark/15 dark:text-signal-dark',
    warning: 'bg-flag/10 text-flag dark:bg-flag-light/15 dark:text-flag-light',
    danger: 'bg-flag/15 text-flag dark:bg-flag-light/20 dark:text-flag-light',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide ${toneClasses[tone]}`}
    >
      {children}
    </span>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-line/60 dark:bg-line-dark/60 ${className}`} />
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-line px-6 py-14 text-center dark:border-line-dark">
      {icon && <div className="text-ink/30 dark:text-ink-dark/30">{icon}</div>}
      <div>
        <p className="font-display text-lg text-ink dark:text-ink-dark">{title}</p>
        {description && (
          <p className="mt-1 font-body text-sm text-ink/60 dark:text-ink-dark/60">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
