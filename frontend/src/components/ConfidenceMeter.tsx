export function ConfidenceMeter({ value }: { value: number }) {
  const tone = value >= 60 ? 'text-signal dark:text-signal-dark' : value > 0 ? 'text-flag dark:text-flag-light' : 'text-ink/30 dark:text-ink-dark/30'
  return (
    <div className="flex items-center gap-2">
      <div className="h-1 w-16 overflow-hidden rounded-full bg-line dark:bg-line-dark">
        <div
          className={`h-full rounded-full ${value >= 60 ? 'bg-signal dark:bg-signal-dark' : 'bg-flag dark:bg-flag-light'}`}
          style={{ width: `${Math.max(value, 2)}%` }}
        />
      </div>
      <span className={`font-mono text-xs ${tone}`}>{value.toFixed(0)}%</span>
    </div>
  )
}
