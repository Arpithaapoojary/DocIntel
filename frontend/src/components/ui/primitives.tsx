import type { InputHTMLAttributes, LabelHTMLAttributes, ReactNode } from 'react'

export function Card({
  children,
  className = '',
  hover = false,
}: {
  children: ReactNode
  className?: string
  hover?: boolean
  glass?: boolean
}) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900
        ${hover ? 'hover:border-slate-300 dark:hover:border-slate-700' : ''}
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
      <label htmlFor={fieldId} className="font-sans text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
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
          className={`w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 font-sans text-sm text-slate-900
            placeholder:text-slate-400 transition-colors
            focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600
            dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500
            dark:focus:border-brand-500 dark:focus:ring-brand-500
            ${leftIcon ? 'pl-10' : ''}
            ${rightElement ? 'pr-10' : ''}
            ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500 dark:border-rose-500' : ''} ${className}`}
          {...rest}
        />
        {rightElement && (
          <div className="absolute right-3.5 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {hint && !error && (
        <span className="font-sans text-xs text-slate-500 dark:text-slate-400">{hint}</span>
      )}
      {error && (
        <span className="font-sans text-xs sm:text-sm font-medium text-rose-600 dark:text-rose-400">
          {error}
        </span>
      )}
    </div>
  )
}

export function LabelText({ children, ...rest }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className="font-sans text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300" {...rest}>
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
    neutral: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    primary: 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-950/60 dark:text-brand-300 dark:border-brand-900',
    accent:  'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900',
    danger:  'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900',
  }

  const dotClasses: Record<string, string> = {
    neutral: 'bg-slate-400',
    primary: 'bg-brand-600',
    accent:  'bg-blue-600',
    success: 'bg-emerald-600',
    warning: 'bg-amber-600',
    danger:  'bg-rose-600',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 font-mono text-xs font-medium tracking-tight ${toneClasses[tone] || toneClasses.neutral}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotClasses[tone] || dotClasses.neutral}`} />}
      {children}
    </span>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200/70 dark:bg-slate-800/70 ${className}`}
    />
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
    <div className="flex flex-col items-center justify-center gap-3.5 rounded-xl border border-dashed border-slate-200 bg-white/60 px-6 py-12 text-center dark:border-slate-800 dark:bg-slate-900/40">
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
          {icon}
        </div>
      )}
      <div className="max-w-md">
        <p className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">{title}</p>
        {description && (
          <p className="mt-1.5 font-sans text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
