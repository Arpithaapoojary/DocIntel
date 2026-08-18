import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

const variantClasses: Record<string, string> = {
  primary:
    'bg-gradient-to-r from-primary to-primary-600 text-white shadow-glow-sm ' +
    'hover:shadow-glow-primary hover:from-primary-600 hover:to-primary-700 ' +
    'active:scale-[0.97] dark:from-primary dark:to-primary-600',
  secondary:
    'border border-line bg-surface text-ink ' +
    'hover:border-primary/40 hover:bg-primary/5 hover:text-primary ' +
    'dark:border-line-dark dark:bg-surface-dark dark:text-ink-dark ' +
    'dark:hover:border-primary/40 dark:hover:bg-primary/8 dark:hover:text-primary-300 ' +
    'active:scale-[0.97]',
  ghost:
    'text-ink/70 hover:bg-primary/8 hover:text-primary ' +
    'dark:text-ink-dark/70 dark:hover:bg-primary/12 dark:hover:text-primary-300 ' +
    'active:scale-[0.97]',
  destructive:
    'bg-gradient-to-r from-danger to-danger/80 text-white ' +
    'hover:from-danger/90 hover:to-danger/70 shadow-sm active:scale-[0.97] ' +
    'dark:from-danger-dark dark:to-danger-dark/80',
}

const sizeClasses: Record<string, string> = {
  sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
  md: 'h-9 px-4 text-sm rounded-lg gap-2',
  lg: 'h-11 px-6 text-sm rounded-xl gap-2',
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
      className={`inline-flex items-center justify-center font-body font-medium
        transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {children}
    </button>
  )
}
