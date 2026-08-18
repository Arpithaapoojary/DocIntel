export function ConfidenceMeter({ value }: { value: number }) {
  const isHigh   = value >= 70
  const isMedium = value >= 35

  const barColor = isHigh
    ? 'from-success to-accent'
    : isMedium
    ? 'from-warning to-warning/60'
    : value > 0
    ? 'from-danger/70 to-danger/40'
    : 'from-line to-line-dark'

  const textColor = isHigh
    ? 'text-success dark:text-success-dark'
    : isMedium
    ? 'text-warning dark:text-warning-dark'
    : value > 0
    ? 'text-danger dark:text-danger-dark'
    : 'text-ink/30 dark:text-ink-dark/30'

  return (
    <div className="flex items-center gap-2.5">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-line/80 dark:bg-line-dark">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700`}
          style={{ width: `${Math.max(value, 2)}%` }}
        />
      </div>
      <span className={`font-mono text-[11px] font-medium ${textColor}`}>
        {value.toFixed(0)}%
      </span>
    </div>
  )
}
