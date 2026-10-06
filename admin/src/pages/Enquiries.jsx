import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Inbox, Search, X } from 'lucide-react'
import { Button, Card, Empty, ErrorNote, Input, PageHeader, Pagination, Select, SkeletonRows, StatusBadge } from '../components/ui'
import { ENQUIRY_STATUSES, TOPICS, topicLabel } from '../lib/constants'
import { fmtDate, fmtRelative } from '../lib/format'
import { useApi, useDebounced } from '../lib/hooks'

const LIMIT = 25

export default function Enquiries() {
  const [sp, setSp] = useSearchParams()
  const nav = useNavigate()
  const [q, setQ] = useState(sp.get('q') || '')
  const dq = useDebounced(q)
  const status = sp.get('status') || ''
  const topic = sp.get('topic') || ''
  const offset = Number(sp.get('offset') || 0)
  const { data, error, loading, reload } = useApi('/admin/enquiries', { q: dq.trim(), status, topic, limit: LIMIT, offset })

  const set = (k, v) => {
    const next = new URLSearchParams(sp)
    if (v) next.set(k, v)
    else next.delete(k)
    if (k !== 'offset') next.delete('offset')
    setSp(next, { replace: true })
  }
  const urlQ = sp.get('q') || ''
  useEffect(() => {
    if (urlQ === dq.trim()) return
    setSp((prev) => {
      const next = new URLSearchParams(prev)
      if (dq.trim()) next.set('q', dq.trim())
      else next.delete('q')
      next.delete('offset')
      return next
    }, { replace: true })
  }, [dq, urlQ, setSp])

  const filtered = !!(dq || status || topic)

  return (
    <>
      <PageHeader title="Enquiries" sub="Messages sent through the contact form." />
      <Card>
        <div className="grid gap-2 border-b border-line p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
            <Input type="search" placeholder="Search name, email, organisation, message…" aria-label="Search enquiries" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
          <Select aria-label="Status" value={status} onChange={(e) => set('status', e.target.value)}>
            <option value="">All statuses</option>
            {ENQUIRY_STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
          </Select>
          <Select aria-label="Topic" value={topic} onChange={(e) => set('topic', e.target.value)}>
            <option value="">All topics</option>
            {Object.entries(TOPICS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
          {filtered && <Button variant="ghost" icon={X} onClick={() => { setQ(''); setSp({}, { replace: true }) }}>Clear</Button>}
        </div>

        {error && <div className="p-4"><ErrorNote error={error} onRetry={reload} /></div>}
        {!data && !error ? <SkeletonRows /> : data && (
          data.items.length === 0 ? (
            <Empty icon={Inbox} title={filtered ? 'No enquiries match' : 'No enquiries yet'}>
              {filtered ? 'Try clearing a filter.' : 'Messages from the contact page will appear here.'}
            </Empty>
          ) : (
            <div className={loading ? 'opacity-60 transition' : 'transition'}>
              <ul className="divide-y divide-line">
                {data.items.map((e) => (
                  <li key={e.id} onClick={() => nav(`/enquiries/${e.id}`)} className="flex cursor-pointer items-start gap-3 px-4 py-3 transition hover:bg-sunken sm:px-5">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${e.status === 'new' ? 'bg-accent' : 'bg-transparent'}`} aria-hidden />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <Link to={`/enquiries/${e.id}`} onClick={(ev) => ev.stopPropagation()} className={`truncate ${e.status === 'new' ? 'font-bold' : 'font-medium'}`}>{e.name}</Link>
                        <span className="truncate text-xs text-muted">{e.org || e.email}</span>
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-sm text-muted"><span className="text-ink/80">{topicLabel(e.topic)}</span> · {e.message}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <StatusBadge status={e.status} />
                      <span className="text-xs text-muted" title={fmtDate(e.created_at)}>{fmtRelative(e.created_at)}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <Pagination total={data.total} limit={LIMIT} offset={offset} onChange={(o) => set('offset', o ? String(o) : '')} />
            </div>
          )
        )}
      </Card>
    </>
  )
}
