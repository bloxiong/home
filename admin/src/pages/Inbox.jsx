import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, Reply, X } from 'lucide-react'
import { Button, Card, Empty, ErrorNote, PageHeader, Pagination, SearchInput, Select, SkeletonRows, StatusBadge } from '../components/ui'
import { MAIL_STATUSES } from '../lib/constants'
import { fmtDate, fmtRelative } from '../lib/format'
import { useApi, useDebounced } from '../lib/hooks'

const LIMIT = 25

export default function Inbox() {
  const [sp, setSp] = useSearchParams()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const dq = useDebounced(q)
  const status = sp.get('status') || ''
  const offset = Number(sp.get('offset') || 0)
  const { data, error, loading, reload } = useApi('/admin/inbox', { q: dq.trim(), status, limit: LIMIT, offset })

  const set = (k, v) => {
    const next = new URLSearchParams(sp)
    if (v) next.set(k, v)
    else next.delete(k)
    if (k !== 'offset') next.delete('offset')
    setSp(next, { replace: true })
  }
  const filtered = !!(dq || status)

  return (
    <>
      <PageHeader title="Inbox" sub="Email sent to contact@bloxio.tech, and whether it has been answered." />
      <Card>
        <div className="grid grid-cols-2 gap-3 border-b border-line p-4 sm:p-5 lg:grid-cols-[1fr_auto_auto]">
          <SearchInput className="col-span-2 lg:col-span-1" placeholder="Search name, email, subject, message…" aria-label="Search inbox" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select aria-label="Status" value={status} onChange={(e) => set('status', e.target.value)}>
            <option value="">All statuses</option>
            {MAIL_STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
          </Select>
          {filtered && <Button variant="ghost" icon={X} onClick={() => { setQ(''); setSp({}, { replace: true }) }}>Clear</Button>}
        </div>
        {error && <div className="p-4"><ErrorNote error={error} onRetry={reload} /></div>}
        {!data && !error ? <SkeletonRows /> : data && (
          data.items.length === 0 ? (
            <Empty icon={Mail} title={filtered ? 'No conversations match' : 'Nothing here yet'}>
              {filtered ? 'Try clearing a filter.' : 'Email sent to contact@bloxio.tech will appear here.'}
            </Empty>
          ) : (
            <div className={loading ? 'opacity-60 transition' : 'transition'}>
              <ul className="divide-y divide-line">
                {data.items.map((t) => (
                  <li key={t.id} onClick={() => nav(`/inbox/${t.id}`)} className="flex cursor-pointer items-start gap-3 px-5 py-4 transition hover:bg-ink/[0.035] sm:px-6">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${t.status === 'new' ? 'bg-accent' : 'bg-transparent'}`} aria-hidden />
                    <div className="min-w-0 flex-1">
                      <Link to={`/inbox/${t.id}`} onClick={(ev) => ev.stopPropagation()} className={`block truncate ${t.status === 'new' ? 'font-bold' : 'font-medium'}`}>{t.contact_name || t.contact_email}</Link>
                      <p className="truncate text-sm">{t.subject || '(no subject)'}{t.count > 1 && <span className="text-muted"> · {t.count}</span>}</p>
                      <p className="mt-0.5 truncate text-xs text-muted">
                        {t.last_direction === 'out' && <Reply className="mr-1 inline h-3 w-3" aria-label="You replied" />}
                        {t.snippet || t.contact_email}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <StatusBadge status={t.status} />
                      <span className="text-xs text-muted" title={fmtDate(t.last_message_at)}>{fmtRelative(t.last_message_at)}</span>
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
