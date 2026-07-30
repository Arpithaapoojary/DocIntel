import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md'
  loading?: boolean
  children: ReactNode
}

const variantClasses: Record<string, string> = {
  primary:
    'bg-signal text-white hover:bg-signal/90 dark:bg-signal-dark dark:text-paper-dark dark:hover:bg-signal-dark/90',
  secondary:
    'border border-line bg-surface text-ink hover:bg-paper dark:border-line-dark dark:bg-surface-dark dark:text-ink-dark dark:hover:bg-paper-dark',
  ghost: 'text-ink hover:bg-line/40 dark:text-ink-dark dark:hover:bg-line-dark/40',
  destructive: 'bg-flag text-white hover:bg-flag/90 dark:bg-flag-light dark:hover:bg-flag-light/90',
}

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-body font-medium
        transition-colors disabled:cursor-not-allowed disabled:opacity-50
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}
