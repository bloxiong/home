import { useState } from 'react'
import { Globe2 } from 'lucide-react'
import BarList from '../components/BarList'
import { Card, CardHeader, Empty, ErrorNote, PageHeader, Select, Skeleton, Stat } from '../components/ui'
import { useApi } from '../lib/hooks'

/* Where visitors come from: views and unique visitors per day, countries,
   cities, pages, referrers and devices. Counted without cookies (see the
   site's privacy notice). */

const countryName = (() => {
  let dn
  try { dn = new Intl.DisplayNames(['en'], { type: 'region' }) } catch { dn = null }
  return (code) => (code ? (dn?.of(code) || code) : 'Unknown')
})()
const flag = (code) => (code && code.length === 2
  ? String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1a5 + c.charCodeAt(0)))
  : '🌐')

const toMap = (pairs, label = (k) => k || 'Unknown') =>
  Object.fromEntries((pairs || []).map(([k, v]) => [label(k), v]))

function change(cur, prev) {
  if (!prev) return cur ? 'New this period' : 'No visits yet'
  const pct = Math.round(((cur - prev) / prev) * 100)
  return `${pct >= 0 ? '+' : ''}${pct}% vs previous period`
}

/* Daily views (bars) and unique visitors (line), plain SVG */
function DailyChart({ series }) {
  const W = 720, H = 180, pad = 24
  const max = Math.max(1, ...series.map((d) => d.views))
  const bw = (W - pad * 2) / series.length
  const y = (v) => H - pad - (v / max) * (H - pad * 2)
  const line = series.map((d, i) => `${pad + bw * i + bw / 2},${y(d.visitors)}`).join(' ')
  const ticks = [0, Math.ceil(max / 2), max]
  const label = (d) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  const every = Math.ceil(series.length / 7)
  return (
    <div className="p-4 sm:p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Views and visitors per day">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad} x2={W - pad} y1={y(t)} y2={y(t)} className="stroke-line" strokeWidth="1" />
            <text x={0} y={y(t) + 4} className="fill-muted" fontSize="10">{t}</text>
          </g>
        ))}
        {series.map((d, i) => (
          <rect key={d.date} x={pad + bw * i + bw * 0.18} width={bw * 0.64} y={y(d.views)} height={H - pad - y(d.views)}
            rx="2" className="fill-accent/35">
            <title>{`${label(d.date)}: ${d.views} views, ${d.visitors} visitors`}</title>
          </rect>
        ))}
        <polyline points={line} fill="none" className="stroke-accent" strokeWidth="2" strokeLinejoin="round" />
        {series.map((d, i) => (i % every === 0 || i === series.length - 1) && (
          <text key={d.date} x={pad + bw * i + bw / 2} y={H - 6} textAnchor="middle" className="fill-muted" fontSize="10">{label(d.date)}</text>
        ))}
      </svg>
      <div className="mt-2 flex gap-4 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-accent/35" /> Page views</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 bg-accent" /> Visitors</span>
      </div>
    </div>
  )
}

export default function Traffic() {
  const [days, setDays] = useState(30)
  const [host, setHost] = useState('')
  const { data: a, error, reload } = useApi('/admin/analytics', { days, ...(host ? { host } : {}) })

  const views = a?.current.views ?? 0
  return (
    <>
      <PageHeader
        title="Traffic"
        sub="Who is visiting, from where, and what they read. No cookies; locations are approximate."
        actions={(
          <div className="flex gap-2">
            <Select value={host} onChange={(e) => setHost(e.target.value)} aria-label="Site">
              <option value="">All sites</option>
              {(a?.hosts || []).map(([h]) => h && <option key={h} value={h}>{h}</option>)}
            </Select>
            <Select value={days} onChange={(e) => setDays(Number(e.target.value))} aria-label="Period">
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last 12 months</option>
            </Select>
          </div>
        )}
      />
      <ErrorNote error={error} onRetry={reload} />

      {!a && !error ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      ) : a && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Page views" value={views.toLocaleString()} sub={change(views, a.previous.views)} />
            <Stat label="Visitors" value={a.current.visitors.toLocaleString()} sub={change(a.current.visitors, a.previous.visitors)} />
            <Stat label="Pages per visitor" value={a.current.visitors ? (views / a.current.visitors).toFixed(1) : '—'} />
            <Stat label="Countries" value={a.countries.filter(([c]) => c).length} sub={a.countries[0]?.[0] ? `Most from ${countryName(a.countries[0][0])}` : undefined} />
          </div>

          {!views ? (
            <Card className="mt-4">
              <Empty icon={Globe2} title="No visits recorded yet">
                Visits are counted on the live sites once VISIT_SECRET is set in Vercel and Render.
              </Empty>
            </Card>
          ) : (
            <>
              <Card className="mt-4"><CardHeader title="Views and visitors per day" /><DailyChart series={a.series} /></Card>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader title="Countries" />
                  <BarList data={toMap(a.countries, (c) => `${flag(c)}  ${countryName(c)}`)} />
                </Card>
                <Card>
                  <CardHeader title="Cities" sub="Approximate, from the visitor's connection" />
                  <BarList data={Object.fromEntries(a.cities.map((c) =>
                    [`${c.city}${c.region ? `, ${c.region}` : ''} ${flag(c.country)}`, c.views]))} emptyText="No city data yet." />
                </Card>
                <Card><CardHeader title="Top pages" /><BarList data={toMap(a.pages)} /></Card>
                <Card>
                  <CardHeader title="Where they came from" sub="Direct = typed the address, bookmarks or apps" />
                  <BarList data={toMap(a.referrers, (r) => r || 'Direct')} />
                </Card>
                <Card><CardHeader title="Devices" /><BarList data={toMap(a.devices)} /></Card>
                <Card><CardHeader title="Browsers" /><BarList data={toMap(a.browsers)} /></Card>
              </div>
            </>
          )}
        </>
      )}
    </>
  )
}
