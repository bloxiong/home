import { useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { cx } from '../lib/cx'
import { Empty } from './ui'

/*
 * Charts, built on the site tokens (see --viz-* in index.css; palettes were
 * checked with the dataviz validator for both surfaces). Marks carry colour,
 * text always uses ink tokens. Every chart has a hover/focus readout and the
 * values are also reachable as text (legends, rows or a hidden table).
 */

const fmt = (n) => Number(n || 0).toLocaleString('en-GB')
const pct = (v, total) => (total ? Math.round((v / total) * 1000) / 10 : 0)
const pctText = (p) => `${p % 1 === 0 ? p : p.toFixed(1)}%`

/* ── change vs previous period ───────────────────────────────────────── */
export function Delta({ cur, prev, className }) {
  if (!prev) {
    return <span className={cx('inline-flex items-center gap-1 text-xs text-muted', className)}>{cur ? 'new this period' : 'no data yet'}</span>
  }
  const p = Math.round(((cur - prev) / prev) * 100)
  const Icon = p > 0 ? ArrowUpRight : p < 0 ? ArrowDownRight : Minus
  return (
    <span className={cx('tnum inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-bold',
      p > 0 ? 'bg-accent/12 text-accent' : p < 0 ? 'bg-danger/12 text-danger' : 'bg-ink/5 text-muted', className)}>
      <Icon className="h-3.5 w-3.5" aria-hidden />{p > 0 ? '+' : ''}{p}%
      <span className="sr-only"> vs previous period</span>
    </span>
  )
}

/* ── responsive width ────────────────────────────────────────────────── */
function useWidth() {
  const ref = useRef(null)
  const [w, setW] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, w]
}

/* clean axis maximum and ticks: 0 / 5 / 10 / 15 … */
function niceTicks(max, count = 4) {
  if (max <= 0) return [0, 1]
  const raw = max / count
  const mag = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) || 10 * mag
  const top = Math.ceil(max / step) * step
  const out = []
  for (let v = 0; v <= top + 1e-9; v += step) out.push(Math.round(v * 100) / 100)
  return out
}

/* monotone cubic path (no overshoot below zero) */
function smoothPath(pts) {
  if (pts.length < 2) return pts.length ? `M${pts[0][0]},${pts[0][1]}` : ''
  const n = pts.length
  const dx = [], m = [], t = new Array(n)
  for (let i = 0; i < n - 1; i++) {
    dx[i] = pts[i + 1][0] - pts[i][0]
    m[i] = (pts[i + 1][1] - pts[i][1]) / dx[i]
  }
  t[0] = m[0]; t[n - 1] = m[n - 2]
  for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (3 * (dx[i - 1] + dx[i])) / ((2 * dx[i] + dx[i - 1]) / m[i - 1] + (dx[i] + 2 * dx[i - 1]) / m[i])
  let d = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3
    d += ` C${pts[i][0] + h},${pts[i][1] + t[i] * h} ${pts[i + 1][0] - h},${pts[i + 1][1] - t[i + 1] * h} ${pts[i + 1][0]},${pts[i + 1][1]}`
  }
  return d
}

const day = (s) => new Date(`${s}T12:00:00Z`)
const fmtDay = (s, o) => day(s).toLocaleDateString('en-GB', { timeZone: 'UTC', ...o })

/* ── daily views (area) + visitors (line) ────────────────────────────── */
export function TrendChart({ series, height = 260 }) {
  const [wrap, w] = useWidth()
  const gid = useId().replace(/:/g, '')
  const [hover, setHover] = useState(null)
  const n = series.length
  const M = { l: 40, r: 14, t: 22, b: 30 }
  const W = Math.max(w, 280)
  const iw = W - M.l - M.r
  const ih = height - M.t - M.b
  const ticks = niceTicks(Math.max(1, ...series.map((d) => d.views)))
  const top = ticks[ticks.length - 1]
  const x = (i) => M.l + (n > 1 ? (i / (n - 1)) * iw : iw / 2)
  const y = (v) => M.t + ih - (v / top) * ih
  const step = n > 1 ? iw / (n - 1) : iw

  const views = series.map((d, i) => [x(i), y(d.views)])
  const visitors = series.map((d, i) => [x(i), y(d.visitors)])
  const line = smoothPath(views)
  const area = n ? `${line} L${x(n - 1)},${y(0)} L${x(0)},${y(0)} Z` : ''
  const peak = series.reduce((b, d, i) => (d.views > (series[b]?.views ?? -1) ? i : b), 0)

  // x labels: weekdays for short ranges, Mondays for a month or so, month starts beyond
  const labels = useMemo(() => {
    const out = []
    const minGap = 52
    let last = -Infinity
    series.forEach((d, i) => {
      const dt = day(d.date)
      let text = null
      if (n <= 10) text = fmtDay(d.date, { weekday: 'short', day: 'numeric' })
      else if (n <= 60) { if (dt.getUTCDay() === 1) text = fmtDay(d.date, { day: 'numeric', month: 'short' }) }
      else if (dt.getUTCDate() === 1) text = fmtDay(d.date, { month: 'short' })
      if (text && x(i) - last >= minGap) { out.push({ i, text }); last = x(i) }
    })
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [series, W])

  const weekends = n <= 60 ? series.map((d, i) => ([0, 6].includes(day(d.date).getUTCDay()) ? i : -1)).filter((i) => i >= 0) : []

  function pick(clientX) {
    const r = wrap.current.getBoundingClientRect()
    const i = Math.round((clientX - r.left - M.l) / step)
    setHover(Math.max(0, Math.min(n - 1, i)))
  }
  function onKey(e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      setHover((h) => Math.max(0, Math.min(n - 1, (h ?? (e.key === 'ArrowRight' ? -1 : n)) + (e.key === 'ArrowRight' ? 1 : -1))))
    } else if (e.key === 'Escape') setHover(null)
  }

  const hd = hover != null ? series[hover] : null
  const tipLeft = hd ? Math.min(Math.max(x(hover), 90), W - 90) : 0

  return (
    <div ref={wrap} className="relative select-none">
      {w > 0 && (
        <svg width={W} height={height} className="block touch-pan-y outline-none" role="img" tabIndex={0}
          aria-label={`Daily page views and visitors, ${n} days. Peak ${fmt(series[peak]?.views)} views on ${series[peak] ? fmtDay(series[peak].date, { day: 'numeric', month: 'long' }) : ''}. Use the arrow keys to read each day.`}
          onPointerMove={(e) => pick(e.clientX)} onPointerDown={(e) => pick(e.clientX)} onPointerLeave={(e) => e.pointerType === 'mouse' && setHover(null)}
          onKeyDown={onKey} onBlur={() => setHover(null)}>
          <defs>
            <linearGradient id={`g${gid}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--viz-1)" stopOpacity="0.32" />
              <stop offset="100%" stopColor="var(--viz-1)" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {weekends.map((i) => (
            <rect key={i} x={x(i) - step / 2} y={M.t} width={step} height={ih} fill="var(--viz-track)" opacity="0.6" />
          ))}
          {ticks.map((t) => (
            <g key={t}>
              <line x1={M.l} x2={W - M.r} y1={y(t)} y2={y(t)} stroke="var(--viz-grid)" />
              <text x={M.l - 10} y={y(t) + 4} textAnchor="end" className="tnum fill-muted font-mono" fontSize="11">{fmt(t)}</text>
            </g>
          ))}
          {labels.map(({ i, text }) => (
            <text key={i} x={x(i)} y={height - 8} textAnchor="middle" className="fill-muted" fontSize="11">{text}</text>
          ))}
          <path d={area} fill={`url(#g${gid})`} />
          <path d={line} fill="none" stroke="var(--viz-1)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          <path d={smoothPath(visitors)} fill="none" stroke="var(--viz-2)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          {/* label the peak only */}
          {series[peak]?.views > 0 && hover == null && (
            <g>
              <circle cx={x(peak)} cy={y(series[peak].views)} r="4" fill="var(--viz-1)" stroke="var(--bx-surface)" strokeWidth="2" />
              <text x={Math.min(Math.max(x(peak), M.l + 30), W - M.r - 30)} y={y(series[peak].views) - 10} textAnchor="middle" className="tnum fill-ink font-bold" fontSize="11">
                {fmt(series[peak].views)}
              </text>
            </g>
          )}
          {hd && (
            <g pointerEvents="none">
              <line x1={x(hover)} x2={x(hover)} y1={M.t} y2={M.t + ih} stroke="var(--bx-muted)" strokeOpacity="0.5" />
              <circle cx={x(hover)} cy={y(hd.views)} r="4.5" fill="var(--viz-1)" stroke="var(--bx-surface)" strokeWidth="2" />
              <circle cx={x(hover)} cy={y(hd.visitors)} r="4.5" fill="var(--viz-2)" stroke="var(--bx-surface)" strokeWidth="2" />
            </g>
          )}
        </svg>
      )}
      {hd && (
        <div role="status" className="pointer-events-none absolute top-0 z-10 w-44 -translate-x-1/2 rounded-xl border border-line bg-surface/95 px-3 py-2.5 text-xs shadow-xl backdrop-blur"
          style={{ left: tipLeft }}>
          <p className="mb-1.5 font-bold text-ink">{fmtDay(hd.date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
          <p className="flex items-center gap-2"><span className="h-0.5 w-3 rounded bg-[var(--viz-1)]" /><b className="tnum text-sm text-ink">{fmt(hd.views)}</b><span className="text-muted">views</span></p>
          <p className="mt-0.5 flex items-center gap-2"><span className="h-0.5 w-3 rounded bg-[var(--viz-2)]" /><b className="tnum text-sm text-ink">{fmt(hd.visitors)}</b><span className="text-muted">visitors</span></p>
        </div>
      )}
      <table className="sr-only">
        <caption>Views and visitors per day</caption>
        <thead><tr><th>Date</th><th>Views</th><th>Visitors</th></tr></thead>
        <tbody>{series.map((d) => <tr key={d.date}><td>{d.date}</td><td>{d.views}</td><td>{d.visitors}</td></tr>)}</tbody>
      </table>
    </div>
  )
}

export function LegendKey({ color, label, shape = 'line' }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs text-muted">
      <span className={shape === 'line' ? 'h-0.5 w-4 rounded' : 'h-2.5 w-2.5 rounded-[3px]'} style={{ background: color }} />
      {label}
    </span>
  )
}

/* ── donut with centre total and a % legend (devices, browsers) ─────── */
const CAT = ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-3)', 'var(--viz-4)']

export function Donut({ data, unit = 'views', emptyText = 'No data yet.' }) {
  const [hover, setHover] = useState(null)
  const rows = useMemo(() => {
    const sorted = Object.entries(data || {}).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1])
    const head = sorted.slice(0, 4).map(([label, v], i) => ({ label, v, color: CAT[i] }))
    const rest = sorted.slice(4).reduce((s, [, v]) => s + v, 0)
    return rest ? [...head, { label: 'Other', v: rest, color: 'var(--viz-other)' }] : head
  }, [data])
  const total = rows.reduce((s, r) => s + r.v, 0)
  if (!total) return <Empty title={emptyText} />

  const R = 54, SW = 16, C = 2 * Math.PI * R, GAP = rows.length > 1 ? 2.5 : 0
  const segs = rows.map((r, i) => {
    const before = rows.slice(0, i).reduce((sum, x) => sum + x.v, 0)
    return { ...r, dash: Math.max(0.1, (r.v / total) * C - GAP), off: -(before / total) * C }
  })
  const focus = hover != null ? rows[hover] : null

  return (
    <div className="flex flex-col items-center gap-6 p-5 sm:flex-row sm:gap-8 sm:p-6">
      <div className="relative h-40 w-40 shrink-0">
        <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90" role="img"
          aria-label={rows.map((r) => `${r.label} ${pctText(pct(r.v, total))}`).join(', ')}>
          <circle cx="70" cy="70" r={R} fill="none" stroke="var(--viz-track)" strokeWidth={SW} />
          {segs.map((s, i) => (
            <circle key={s.label} cx="70" cy="70" r={R} fill="none" stroke={s.color}
              strokeWidth={hover === i ? SW + 4 : SW} strokeDasharray={`${s.dash} ${C}`} strokeDashoffset={s.off}
              opacity={hover == null || hover === i ? 1 : 0.35}
              className="cursor-pointer transition-all duration-200"
              onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)} />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="tnum font-display text-2xl leading-none">{focus ? pctText(pct(focus.v, total)) : fmt(total)}</span>
          <span className="mt-1 max-w-24 truncate text-[11px] text-muted">{focus ? focus.label : `total ${unit}`}</span>
        </div>
      </div>
      <ul className="w-full min-w-0 flex-1 space-y-1">
        {rows.map((r, i) => (
          <li key={r.label} tabIndex={0} onFocus={() => setHover(i)} onBlur={() => setHover(null)}
            onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}
            className={cx('flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm outline-none transition', hover === i && 'bg-ink/5')}>
            <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: r.color }} />
            <span className="min-w-0 flex-1 truncate capitalize">{r.label}</span>
            <span className="tnum text-xs text-muted">{fmt(r.v)}</span>
            <span className="tnum w-12 text-right text-sm font-bold">{pctText(pct(r.v, total))}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ── ranked rows (countries, cities, pages, referrers, respondent types) ── */
export function RankList({ rows, limit = 7, emptyText = 'No data yet.', unit = 'views' }) {
  const [all, setAll] = useState(false)
  const sorted = useMemo(() => [...(rows || [])].filter((r) => r.value > 0).sort((a, b) => b.value - a.value), [rows])
  if (!sorted.length) return <Empty title={emptyText} />
  const total = sorted.reduce((s, r) => s + r.value, 0)
  const max = sorted[0].value
  const shown = all ? sorted : sorted.slice(0, limit)

  return (
    <div className="px-3 py-3 sm:px-4">
      <ol className="space-y-0.5">
        {shown.map((r, i) => {
          const share = pct(r.value, total)
          const lead = i === 0
          return (
            <li key={r.key ?? r.label} title={`${r.label}: ${fmt(r.value)} ${unit} (${pctText(share)})`}
              className="group rounded-xl px-2.5 py-2.5 transition hover:bg-ink/[0.035]">
              <div className="flex items-center gap-3 text-sm">
                <span className={cx('tnum w-5 shrink-0 text-right font-mono text-[11px]', lead ? 'text-gold-ink' : 'text-muted/70')}>{i + 1}</span>
                {r.icon && <span className="shrink-0 text-base leading-none" aria-hidden>{r.icon}</span>}
                <span className={cx('min-w-0 flex-1 truncate', lead ? 'font-bold' : 'font-medium')}>{r.label}</span>
                {r.sub && <span className="hidden truncate text-xs text-muted sm:inline">{r.sub}</span>}
                <span className="tnum shrink-0 text-sm font-bold">{fmt(r.value)}</span>
                <span className="tnum w-12 shrink-0 text-right text-xs text-muted">{pctText(share)}</span>
              </div>
              <div className="ml-8 mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--viz-track)]" aria-hidden>
                <div className="h-full rounded-full transition-[width] duration-700 ease-out"
                  style={{ width: `${Math.max(2, (r.value / max) * 100)}%`, background: lead ? 'var(--viz-1)' : 'color-mix(in oklab, var(--viz-1) 50%, transparent)' }} />
              </div>
            </li>
          )
        })}
      </ol>
      {sorted.length > limit && (
        <button type="button" onClick={() => setAll((a) => !a)}
          className="ml-2.5 mt-2 rounded-lg px-2 py-1.5 text-xs font-bold text-accent hover:bg-accent/10">
          {all ? 'Show fewer' : `Show all ${sorted.length}`}
        </button>
      )}
    </div>
  )
}

/* ── Yes / Maybe / No split ──────────────────────────────────────────── */
const ANSWER = {
  yes: { color: 'var(--viz-yes)', label: 'Yes' },
  maybe: { color: 'var(--viz-maybe)', label: 'Maybe' },
  no: { color: 'var(--viz-no)', label: 'No' },
}

export function AnswerSplit({ data, question }) {
  const [hover, setHover] = useState(null)
  const rows = useMemo(() => {
    const e = Object.entries(data || {}).filter(([, v]) => v > 0)
    const known = ['yes', 'maybe', 'no'].map((k) => {
      const hit = e.find(([l]) => l.toLowerCase() === k)
      return hit ? { key: k, label: ANSWER[k].label, v: hit[1], color: ANSWER[k].color } : null
    }).filter(Boolean)
    const other = e.filter(([l]) => !ANSWER[l.toLowerCase()]).reduce((s, [, v]) => s + v, 0)
    return other ? [...known, { key: 'none', label: 'No answer', v: other, color: 'var(--viz-track)' }] : known
  }, [data])
  const total = rows.reduce((s, r) => s + r.v, 0)
  if (!total) return <Empty title="No answers yet." />
  const yes = rows.find((r) => r.key === 'yes')?.v || 0

  return (
    <div className="p-5 sm:p-6">
      <div className="mb-4 flex items-baseline gap-2">
        <span className="tnum font-display text-4xl leading-none">{pctText(pct(yes, total))}</span>
        <span className="text-sm text-muted">said yes · {fmt(total)} {total === 1 ? 'answer' : 'answers'}</span>
      </div>
      <div className="flex h-3 w-full gap-[2px] overflow-hidden rounded-full" role="img"
        aria-label={`${question}: ${rows.map((r) => `${r.label} ${r.v} (${pctText(pct(r.v, total))})`).join(', ')}`}>
        {rows.map((r, i) => (
          <div key={r.key} className="h-full transition-opacity duration-200 first:rounded-l-full last:rounded-r-full"
            style={{ width: `${(r.v / total) * 100}%`, background: r.color, opacity: hover == null || hover === i ? 1 : 0.35 }}
            onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)} />
        ))}
      </div>
      <ul className="mt-4 space-y-1">
        {rows.map((r, i) => (
          <li key={r.key} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}
            className={cx('flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition', hover === i && 'bg-ink/5')}>
            <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: r.color, boxShadow: r.key === 'none' ? 'inset 0 0 0 1px var(--bx-line)' : undefined }} />
            <span className="flex-1 font-medium">{r.label}</span>
            <span className="tnum text-xs text-muted">{fmt(r.v)}</span>
            <span className="tnum w-12 text-right font-bold">{pctText(pct(r.v, total))}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
