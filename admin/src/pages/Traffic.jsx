import { useState } from 'react'
import { Eye, Globe2, Layers, Users } from 'lucide-react'
import { Delta, Donut, LegendKey, RankList, TrendChart } from '../components/charts'
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
const toRows = (pairs, label = (k) => k || 'Unknown', icon) =>
  (pairs || []).map(([k, v]) => ({ key: k || '—', label: label(k), value: v, icon: icon?.(k) }))

function change(cur, prev) {
  if (!prev) return cur ? 'New this period' : 'No visits yet'
  const pct = Math.round(((cur - prev) / prev) * 100)
  return `${pct >= 0 ? '+' : ''}${pct}% vs previous period`
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
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      ) : a && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <Stat icon={Eye} label="Page views" value={views.toLocaleString()} sub={change(views, a.previous.views)} />
            <Stat icon={Users} label="Visitors" value={a.current.visitors.toLocaleString()} sub={change(a.current.visitors, a.previous.visitors)} />
            <Stat icon={Layers} label="Pages per visitor" value={a.current.visitors ? (views / a.current.visitors).toFixed(1) : '—'} />
            <Stat icon={Globe2} label="Countries" value={a.countries.filter(([c]) => c).length} sub={a.countries[0]?.[0] ? `Most from ${countryName(a.countries[0][0])}` : undefined} />
          </div>

          {!views ? (
            <Card className="mt-5">
              <Empty icon={Globe2} title="No visits recorded yet">
                Visits are counted on the live sites once VISIT_SECRET is set in Vercel and Render.
              </Empty>
            </Card>
          ) : (
            <>
              <Card className="mt-5">
                <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b border-line px-5 py-5 sm:px-6">
                  <div>
                    <h2 className="text-label text-muted">Views and visitors per day</h2>
                    <div className="mt-3 flex flex-wrap items-end gap-x-8 gap-y-3">
                      <div>
                        <p className="flex items-center gap-2"><span className="tnum font-display text-3xl leading-none">{views.toLocaleString()}</span><Delta cur={views} prev={a.previous.views} /></p>
                        <p className="mt-1.5"><LegendKey color="var(--viz-1)" label="Page views" shape="box" /></p>
                      </div>
                      <div>
                        <p className="flex items-center gap-2"><span className="tnum font-display text-3xl leading-none">{a.current.visitors.toLocaleString()}</span><Delta cur={a.current.visitors} prev={a.previous.visitors} /></p>
                        <p className="mt-1.5"><LegendKey color="var(--viz-2)" label="Visitors" /></p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted">vs the previous {days} days · weekends shaded</p>
                </div>
                <div className="px-2 pb-3 pt-4 sm:px-4"><TrendChart series={a.series} /></div>
              </Card>

              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                <Card>
                  <CardHeader title="Countries" />
                  <RankList rows={toRows(a.countries, countryName, flag)} />
                </Card>
                <Card>
                  <CardHeader title="Cities" sub="Approximate, from the visitor's connection" />
                  <RankList emptyText="No city data yet." rows={a.cities.map((c) => ({
                    key: `${c.city}|${c.region}|${c.country}`, label: c.city || 'Unknown', sub: [c.region, countryName(c.country)].filter(Boolean).join(', '),
                    value: c.views, icon: flag(c.country),
                  }))} />
                </Card>
                <Card><CardHeader title="Top pages" /><RankList rows={toRows(a.pages)} /></Card>
                <Card>
                  <CardHeader title="Where they came from" sub="Direct = typed the address, bookmarks or apps" />
                  <RankList rows={toRows(a.referrers, (r) => r || 'Direct')} />
                </Card>
                <Card><CardHeader title="Devices" /><Donut data={toMap(a.devices)} /></Card>
                <Card><CardHeader title="Browsers" /><Donut data={toMap(a.browsers)} /></Card>
              </div>
            </>
          )}
        </>
      )}
    </>
  )
}
