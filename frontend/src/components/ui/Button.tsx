import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline' | 'glow'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

const variantClasses: Record<string, string> = {
  primary:
    'bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-medium shadow-sm ' +
    'hover:from-primary-500 hover:to-indigo-500 hover:shadow-glow-sm hover:-translate-y-0.5 ' +
    'active:translate-y-0 active:scale-[0.98] dark:from-primary-600 dark:to-indigo-600',
  glow:
    'bg-gradient-to-r from-primary-600 via-indigo-600 to-accent-600 text-white font-semibold shadow-glow-primary ' +
    'hover:brightness-110 hover:shadow-glow-primary hover:-translate-y-0.5 ' +
    'active:translate-y-0 active:scale-[0.98]',
  secondary:
    'border border-slate-200 bg-white text-slate-700 font-medium shadow-card ' +
    'hover:border-primary/40 hover:bg-slate-50 hover:text-primary hover:-translate-y-0.5 ' +
    'dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 ' +
    'dark:hover:border-primary/40 dark:hover:bg-slate-800 dark:hover:text-primary-300 ' +
    'active:translate-y-0 active:scale-[0.98]',
  outline:
    'border border-slate-200 bg-transparent text-slate-700 font-medium ' +
    'hover:border-slate-300 hover:bg-slate-100/70 ' +
    'dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800/70 ' +
    'active:scale-[0.98]',
  ghost:
    'text-slate-600 font-medium hover:bg-slate-100 hover:text-slate-900 ' +
    'dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100 ' +
    'active:scale-[0.98]',
  destructive:
    'bg-gradient-to-r from-red-600 to-rose-600 text-white font-medium shadow-sm ' +
    'hover:from-red-500 hover:to-rose-500 hover:shadow-md hover:-translate-y-0.5 ' +
    'active:translate-y-0 active:scale-[0.98]',
}

const sizeClasses: Record<string, string> = {
  xs: 'h-7 px-2.5 text-xs rounded-lg gap-1.5',
  sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
  md: 'h-9 px-4 text-sm rounded-xl gap-2',
  lg: 'h-11 px-5 text-sm rounded-xl gap-2.5 font-semibold',
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
      className={`inline-flex items-center justify-center font-body cursor-pointer
        transition-all duration-200 select-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />}
      {children}
    </button>
  )
}
