import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react'

export function ConfidenceMeter({ value }: { value: number }) {
  const isHigh   = value >= 70
  const isMedium = value >= 35

  const label = isHigh ? 'High Confidence' : isMedium ? 'Partial Grounding' : value > 0 ? 'Low Confidence' : 'Unmatched'
  
  const barColor = isHigh
    ? 'bg-emerald-500'
    : isMedium
    ? 'bg-amber-500'
    : value > 0
    ? 'bg-rose-500'
    : 'bg-slate-300 dark:bg-slate-700'

  const badgeClasses = isHigh
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300'
    : isMedium
    ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300'
    : value > 0
    ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300'
    : 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'

  const Icon = isHigh ? ShieldCheck : isMedium ? AlertTriangle : ShieldAlert

  return (
    <div className="flex items-center gap-2.5">
      {/* Progress bar */}
      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-300`}
          style={{ width: `${Math.max(value, 4)}%` }}
        />
      </div>

      {/* Pill Badge */}
      <div className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.2 font-mono text-[10px] font-medium ${badgeClasses}`}>
        <Icon className="h-3 w-3 shrink-0" />
        <span>{label} ({value.toFixed(0)}%)</span>
      </div>
    </div>
  )
}
