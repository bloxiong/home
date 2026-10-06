import { Empty } from './ui'

/**
 * Horizontal bars: one hue, sorted largest first, value + share labelled directly.
 * `order` pins a known order (e.g. Yes / Maybe / No) instead of sorting by size.
 */
export default function BarList({ data, order, emptyText = 'No answers yet.' }) {
  const entries = Object.entries(data || {})
  if (!entries.length) return <Empty title={emptyText} />
  const total = entries.reduce((s, [, v]) => s + v, 0)
  const max = Math.max(...entries.map(([, v]) => v))
  const rank = (k) => {
    const i = order ? order.indexOf(k) : -1
    return i === -1 ? 999 : i
  }
  entries.sort((a, b) => (order ? rank(a[0]) - rank(b[0]) : 0) || b[1] - a[1])

  return (
    <ul className="space-y-2.5 p-4 sm:p-5">
      {entries.map(([label, v]) => {
        const pct = total ? Math.round((v / total) * 100) : 0
        return (
          <li key={label}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 truncate" title={label}>{label}</span>
              <span className="shrink-0 font-mono text-xs text-muted">
                <b className="font-medium text-ink">{v}</b> · {pct}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-sunken" role="img" aria-label={`${label}: ${v} (${pct}%)`}>
              <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${max ? Math.max(2, (v / max) * 100) : 0}%` }} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
