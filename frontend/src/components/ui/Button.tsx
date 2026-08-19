import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'brand' | 'secondary' | 'ghost' | 'destructive' | 'outline' | 'glow'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

const variantClasses: Record<string, string> = {
  primary:
    'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 ' +
    'dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:active:bg-slate-200 ' +
    'shadow-xs font-medium',
  brand:
    'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 ' +
    'dark:bg-brand-600 dark:hover:bg-brand-500 shadow-xs font-medium',
  glow:
    'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 ' +
    'dark:bg-brand-600 dark:hover:bg-brand-500 shadow-xs font-medium',
  secondary:
    'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 ' +
    'dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:border-slate-700 ' +
    'shadow-xs font-medium',
  outline:
    'border border-slate-200 bg-transparent text-slate-700 hover:bg-slate-100/80 ' +
    'dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/80 font-medium',
  ghost:
    'text-slate-600 hover:bg-slate-100 hover:text-slate-900 ' +
    'dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 font-medium',
  destructive:
    'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-xs font-medium',
}

const sizeClasses: Record<string, string> = {
  xs: 'h-7 px-2.5 text-xs rounded-md gap-1.5',
  sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
  md: 'h-9 px-3.5 text-sm rounded-lg gap-2',
  lg: 'h-10 px-4 text-sm rounded-lg gap-2 font-medium',
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
      className={`inline-flex items-center justify-center font-sans cursor-pointer
        transition-colors select-none disabled:cursor-not-allowed disabled:opacity-50
        ${variantClasses[variant] || variantClasses.primary} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />}
      {children}
    </button>
  )
}
