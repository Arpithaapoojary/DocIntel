import type { InputHTMLAttributes, LabelHTMLAttributes, ReactNode } from 'react'

export function Card({
  children,
  className = '',
  hover = false,
}: {
  children: ReactNode
  className?: string
  hover?: boolean
}) {
  return (
    <div
      className={`rounded-2xl border border-line/60 bg-surface shadow-card transition-all duration-300
        dark:border-line-dark dark:bg-surface-dark dark:shadow-card-dark
        ${hover ? 'hover:shadow-card-hover hover:-translate-y-0.5 dark:hover:shadow-card-dark-hover cursor-pointer' : ''}
        ${className}`}
    >
      {children}
    </div>
  )
}

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export function Field({ label, error, hint, id, className = '', ...rest }: FieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="font-body text-sm font-medium text-ink dark:text-ink-dark">
        {label}
      </label>
      <input
        id={fieldId}
        className={`rounded-xl border border-line bg-paper px-4 py-2.5 font-body text-sm text-ink
          placeholder:text-ink/35 transition-all duration-200
          focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20
          dark:border-line-dark dark:bg-paper-dark dark:text-ink-dark dark:placeholder:text-ink-dark/35
          dark:focus:border-primary/50 dark:focus:ring-primary/15
          ${error ? 'border-danger focus:border-danger focus:ring-danger/20' : ''} ${className}`}
        {...rest}
      />
      {hint && !error && (
        <span className="font-body text-xs text-ink/50 dark:text-ink-dark/50">{hint}</span>
      )}
      {error && (
        <span className="flex items-center gap-1 font-body text-xs text-danger dark:text-danger-dark">
          {error}
        </span>
      )}
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
    neutral: 'bg-ink/8 text-ink/60 dark:bg-white/8 dark:text-ink-dark/60 border border-line/60 dark:border-line-dark',
    success: 'bg-success/10 text-success border border-success/20 dark:bg-success-dark/15 dark:text-success-dark dark:border-success-dark/25',
    warning: 'bg-warning/10 text-warning border border-warning/20 dark:bg-warning-dark/15 dark:text-warning-dark dark:border-warning-dark/25',
    danger:  'bg-danger/10 text-danger border border-danger/20 dark:bg-danger-dark/15 dark:text-danger-dark dark:border-danger-dark/25',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider font-medium ${toneClasses[tone]}`}
    >
      {children}
    </span>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-line/60 dark:bg-line-dark/60 ${className}`}
    >
      <div className="absolute inset-0 shimmer" />
    </div>
  )
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
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-line/60 bg-primary/2 px-8 py-16 text-center dark:border-line-dark dark:bg-primary/5 animate-fade-in">
      {icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 text-primary dark:from-primary/20 dark:to-accent/15 dark:text-primary-300">
          {icon}
        </div>
      )}
      <div>
        <p className="font-display text-lg font-semibold text-ink dark:text-ink-dark">{title}</p>
        {description && (
          <p className="mt-1.5 font-body text-sm text-ink/55 dark:text-ink-dark/55 max-w-xs mx-auto text-balance">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}
