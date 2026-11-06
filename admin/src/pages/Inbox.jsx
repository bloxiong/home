import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, Reply, X } from 'lucide-react'
import { Button, Card, Empty, ErrorNote, PageHeader, Pagination, SearchInput, Select, SkeletonRows, StatusBadge } from '../components/ui'
import { prefetch } from '../lib/api'
import { OPEN_STATUSES } from '../lib/constants'
import { fmtDate, fmtRelative } from '../lib/format'
import { useAuth } from '../lib/contexts'
import { useApi, useDebounced } from '../lib/hooks'

const LIMIT = 25

function Tab({ active, onClick, label, count }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={`inline-flex max-w-full items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${active ? 'border-accent bg-accent text-on-accent' : 'border-line text-muted hover:text-ink'}`}>
      <span className="truncate">{label}</span><span className={`font-mono text-xs ${active ? '' : 'text-muted'}`}>{count ?? '–'}</span>
    </button>
  )
}

export default function Inbox() {
  const [sp, setSp] = useSearchParams()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const dq = useDebounced(q)
  const state = sp.get('state') === 'closed' ? 'closed' : 'open'
  const kind = sp.get('kind') === 'platform' ? 'platform' : 'person'
  const status = sp.get('status') || ''
  const { admin } = useAuth()
  const mailbox = sp.get('mailbox') || admin?.email?.toLowerCase() || ''
  const offset = Number(sp.get('offset') || 0)
  const { data, error, loading, reload } = useApi('/admin/inbox', { q: dq.trim(), state, kind, status, mailbox, limit: LIMIT, offset })

  const set = (k, v) => {
    const next = new URLSearchParams(sp)
    if (v) next.set(k, v)
    else next.delete(k)
    if (k !== 'offset') next.delete('offset')
    if (k === 'state' || k === 'mailbox') next.delete('status')
    setSp(next, { replace: true })
  }
  const filtered = !!(dq || status)
  const mailboxes = data?.mailboxes || []

  return (
    <>
      <PageHeader title="Inbox" sub={kind === 'platform' ? 'Automated mail from services like Instagram and X. It stays out of your New count.' : 'Conversations with people in your BLOXio mailboxes.'} />
      {mailboxes.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Mailbox">
          {mailboxes.map((m) => <Tab key={m} active={m === (mailboxes.includes(mailbox) ? mailbox : mailboxes[0])} onClick={() => set('mailbox', m)} label={m} count={data?.mailbox_new?.[m]} />)}
        </div>
      )}
      <div className="mb-3 flex flex-wrap gap-2">
        <Tab active={kind === 'person'} onClick={() => set('kind', '')} label="People" count={data?.people} />
        <Tab active={kind === 'platform'} onClick={() => set('kind', 'platform')} label="Platforms" count={data?.platforms} />
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <Tab active={state === 'open'} onClick={() => set('state', '')} label="Open" count={data?.open} />
        <Tab active={state === 'closed'} onClick={() => set('state', 'closed')} label="Closed" count={data?.closed} />
      </div>
      <Card>
        <div className="grid grid-cols-1 gap-3 border-b border-line p-4 min-[360px]:grid-cols-2 sm:p-5 lg:grid-cols-[1fr_auto_auto]">
          <SearchInput className="min-[360px]:col-span-2 lg:col-span-1" placeholder="Search name, email, subject, message…" aria-label="Search inbox" value={q} onChange={(e) => setQ(e.target.value)} />
          {state === 'open' && (
            <Select aria-label="Status" value={status} onChange={(e) => set('status', e.target.value)}>
              <option value="">All statuses</option>
              {OPEN_STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
            </Select>
          )}
          {filtered && <Button variant="ghost" icon={X} onClick={() => { setQ(''); setSp({ ...(sp.get('mailbox') ? { mailbox } : {}), ...(state === 'closed' ? { state } : {}), ...(kind === 'platform' ? { kind } : {}) }, { replace: true }) }}>Clear</Button>}
        </div>
        {error && <div className="p-4"><ErrorNote error={error} onRetry={reload} /></div>}
        {!data && !error ? <SkeletonRows /> : data && (
          data.items.length === 0 ? (
            <Empty icon={Mail} title={filtered ? 'No conversations match' : state === 'closed' ? 'No closed conversations' : 'No open conversations'}>
              {filtered ? 'Try clearing a filter.' : state === 'closed' ? 'Conversations you close will appear here.' : 'Email to your mailboxes will appear here.'}
            </Empty>
          ) : (
            <div className={loading ? 'opacity-60 transition' : 'transition'}>
              <ul className="divide-y divide-line">
                {data.items.map((t) => (
                  <li key={t.id} onClick={() => nav(`/inbox/${t.id}`)} onPointerEnter={() => prefetch(`/admin/inbox/${t.id}`)} className="flex cursor-pointer items-start gap-3 px-5 py-4 transition hover:bg-ink/[0.035] sm:px-6">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${t.status === 'new' ? 'bg-accent' : 'bg-transparent'}`} aria-hidden />
                    <div className="min-w-0 flex-1">
                      <Link to={`/inbox/${t.id}`} onClick={(ev) => ev.stopPropagation()} className={`block truncate ${t.status === 'new' ? 'font-bold' : 'font-medium'}`}>{t.contact_name || t.contact_email}</Link>
                      <p className="truncate text-sm">{t.subject || '(no subject)'}{t.count > 1 && <span className="text-muted"> · {t.count}</span>}</p>
                      <p className="mt-0.5 truncate text-xs text-muted">
                        {t.last_direction === 'out' && <Reply className="mr-1 inline h-3 w-3" aria-label="You replied" />}
                        {t.snippet || 'The text of this email is in Gmail.'}
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
