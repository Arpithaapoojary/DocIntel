import type { InputHTMLAttributes, LabelHTMLAttributes, ReactNode } from 'react'

export function Card({
  children,
  className = '',
  hover = false,
  glass = false,
}: {
  children: ReactNode
  className?: string
  hover?: boolean
  glass?: boolean
}) {
  return (
    <div
      className={`rounded-2xl transition-all duration-300
        ${glass
          ? 'glass-card'
          : 'border border-slate-200/80 bg-white shadow-card dark:border-slate-800/80 dark:bg-slate-900 dark:shadow-card-dark'
        }
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
  leftIcon?: ReactNode
  rightElement?: ReactNode
}

export function Field({
  label,
  error,
  hint,
  id,
  className = '',
  leftIcon,
  rightElement,
  ...rest
}: FieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="font-body text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
            {leftIcon}
          </div>
        )}
        <input
          id={fieldId}
          className={`w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 font-body text-sm text-slate-900
            placeholder:text-slate-400 transition-all duration-200
            focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10
            dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-100 dark:placeholder:text-slate-500
            dark:focus:border-primary/80 dark:focus:bg-slate-900 dark:focus:ring-primary/20
            ${leftIcon ? 'pl-10' : ''}
            ${rightElement ? 'pr-10' : ''}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10 dark:border-red-500' : ''} ${className}`}
          {...rest}
        />
        {rightElement && (
          <div className="absolute right-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {hint && !error && (
        <span className="font-body text-xs text-slate-500 dark:text-slate-400">{hint}</span>
      )}
      {error && (
        <span className="flex items-center gap-1 font-body text-xs font-medium text-red-500 dark:text-red-400">
          {error}
        </span>
      )}
    </div>
  )
}

export function LabelText({ children, ...rest }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className="font-body text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300" {...rest}>
      {children}
    </label>
  )
}

export function Badge({
  children,
  tone = 'neutral',
  dot = false,
}: {
  children: ReactNode
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'primary' | 'accent'
  dot?: boolean
}) {
  const toneClasses: Record<string, string> = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200/80 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/80',
    primary: 'bg-primary-50 text-primary-700 border-primary-200/80 dark:bg-primary-950/40 dark:text-primary-300 dark:border-primary-800/50',
    accent:  'bg-cyan-50 text-cyan-700 border-cyan-200/80 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800/50',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50',
    danger:  'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50',
  }

  const dotClasses: Record<string, string> = {
    neutral: 'bg-slate-400 dark:bg-slate-400',
    primary: 'bg-primary-500 animate-pulse',
    accent:  'bg-cyan-500 animate-pulse',
    success: 'bg-emerald-500 animate-pulse',
    warning: 'bg-amber-500',
    danger:  'bg-rose-500',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium tracking-tight ${toneClasses[tone]}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotClasses[tone]}`} />}
      {children}
    </span>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-slate-200/70 dark:bg-slate-800/70 ${className}`}
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
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-300/80 bg-white/40 px-8 py-16 text-center backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/40 animate-fade-in">
      {icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-primary-500/20 text-primary shadow-glow-sm dark:from-primary-500/20 dark:to-accent-500/15 dark:text-primary-300">
          {icon}
        </div>
      )}
      <div className="max-w-sm">
        <p className="font-display text-base font-bold text-slate-900 dark:text-slate-100">{title}</p>
        {description && (
          <p className="mt-1.5 font-body text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
