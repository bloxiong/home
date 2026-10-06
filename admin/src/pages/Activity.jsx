import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity as ActivityIcon, ChevronDown } from 'lucide-react'
import { Badge, Card, Empty, ErrorNote, PageHeader, Pagination, Select, SkeletonRows } from '../components/ui'
import { cx } from '../lib/cx'
import { fmtDate, fmtRelative, humanize } from '../lib/format'
import { useApi } from '../lib/hooks'
import { diffPaths, lineDiff } from '../lib/json'

const ENTITIES = ['content', 'survey', 'enquiry', 'email', 'admin']
const LIMIT = 30

const show = (v) => (v === undefined ? '' : typeof v === 'string' ? v : JSON.stringify(v))

function entityLink(x) {
  if (x.entity === 'survey') return `/surveys/${x.entity_id}`
  if (x.entity === 'enquiry') return `/enquiries/${x.entity_id}`
  if (x.entity === 'content' && x.entity_id && !x.entity_id.startsWith('_')) return `/content/${x.entity_id}`
  return null
}

function ChangedFields({ changes }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[32rem] text-left text-xs">
        <thead className="text-label bg-sunken text-muted">
          <tr><th className="px-3 py-2 font-normal">Field</th><th className="px-3 py-2 font-normal">Before</th><th className="px-3 py-2 font-normal">After</th></tr>
        </thead>
        <tbody className="divide-y divide-line">
          {changes.map((c) => (
            <tr key={c.path} className="align-top">
              <td className="whitespace-nowrap px-3 py-2 font-mono text-muted">{c.path}</td>
              <td className="px-3 py-2"><span className={cx('whitespace-pre-wrap break-words', c.kind !== 'added' && 'rounded bg-danger/10 px-1 text-danger')}>{c.kind === 'added' ? <i className="text-muted">none</i> : show(c.before)}</span></td>
              <td className="px-3 py-2"><span className={cx('whitespace-pre-wrap break-words', c.kind !== 'removed' && 'rounded bg-accent/10 px-1 text-accent')}>{c.kind === 'removed' ? <i className="text-muted">removed</i> : show(c.after)}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Unified diff with unchanged runs folded to 3 lines of context. */
function LineDiff({ before, after }) {
  const rows = useMemo(() => {
    const d = lineDiff(JSON.stringify(before ?? null, null, 2), JSON.stringify(after ?? null, null, 2))
    const keep = new Array(d.length).fill(false)
    d.forEach((r, i) => {
      if (r.op !== ' ') for (let k = Math.max(0, i - 3); k <= Math.min(d.length - 1, i + 3); k++) keep[k] = true
    })
    const out = []
    let skipped = 0
    d.forEach((r, i) => {
      if (keep[i]) {
        if (skipped) { out.push({ op: '…', line: `${skipped} unchanged line${skipped === 1 ? '' : 's'}` }); skipped = 0 }
        out.push(r)
      } else skipped++
    })
    if (skipped) out.push({ op: '…', line: `${skipped} unchanged line${skipped === 1 ? '' : 's'}` })
    return out
  }, [before, after])

  return (
    <pre className="max-h-[28rem] overflow-auto rounded-xl border border-line bg-sunken py-2 font-mono text-[11.5px] leading-5">
      {rows.map((r, i) => (
        <div key={i} className={cx('whitespace-pre px-3',
          r.op === '+' && 'bg-accent/12 text-accent', r.op === '-' && 'bg-danger/12 text-danger', r.op === '…' && 'italic text-muted')}>
          <span className="mr-2 inline-block w-3 select-none opacity-70">{r.op === '…' ? '' : r.op}</span>{r.line}
        </div>
      ))}
    </pre>
  )
}

function Row({ x, who }) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState('fields')
  const hasData = x.before != null || x.after != null
  const changes = useMemo(() => (open && hasData ? diffPaths(x.before, x.after) : []), [open, hasData, x.before, x.after])
  const link = entityLink(x)
  const big = JSON.stringify(x.after ?? '').length > 600 || JSON.stringify(x.before ?? '').length > 600

  return (
    <li>
      <div className="flex items-start gap-3 px-5 py-4 sm:px-6">
        <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line bg-sunken font-mono text-[11px] font-medium uppercase">
          {(who.name || x.admin_email).slice(0, 2)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm">
            <b>{who.name || x.admin_email}</b>{' '}
            <span className="text-ink/90">{x.summary || humanize(x.action)}</span>
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
            <span title={fmtDate(x.created_at)}>{fmtRelative(x.created_at)}</span>
            <span aria-hidden>·</span>
            <span>{fmtDate(x.created_at)}</span>
            <Badge>{x.action}</Badge>
            {link && <Link to={link} className="font-bold text-accent hover:underline">Open</Link>}
          </p>
        </div>
        {hasData && (
          <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-muted hover:bg-ink/[0.035] hover:text-ink">
            Changes <ChevronDown className={cx('h-3.5 w-3.5 transition', open && 'rotate-180')} aria-hidden />
          </button>
        )}
      </div>
      {open && (
        <div className="space-y-2 px-4 pb-4 sm:pl-15 sm:pr-5">
          {changes.length === 0 ? <p className="text-xs text-muted">No differences recorded.</p> : (
            <>
              <div className="flex items-center gap-1 text-xs">
                <span className="mr-1 text-muted">{changes.length} changed {changes.length === 1 ? 'field' : 'fields'}</span>
                {['fields', 'lines'].map((v) => (
                  <button key={v} type="button" onClick={() => setView(v)}
                    className={cx('rounded-lg px-2 py-1 font-bold', view === v ? 'bg-accent/15 text-accent' : 'text-muted hover:text-ink')}>
                    {v === 'fields' ? 'Changed fields' : 'Line diff'}
                  </button>
                ))}
              </div>
              {view === 'fields' ? <ChangedFields changes={big ? changes.slice(0, 200) : changes} /> : <LineDiff before={x.before} after={x.after} />}
              {view === 'fields' && changes.length > 200 && <p className="text-xs text-muted">Showing the first 200 changes. Use the line diff for the rest.</p>}
            </>
          )}
        </div>
      )}
    </li>
  )
}

export default function ActivityPage() {
  const [adminEmail, setAdminEmail] = useState('')
  const [entity, setEntity] = useState('')
  const [offset, setOffset] = useState(0)
  const admins = useApi('/admin/admins')
  const { data, error, loading, reload } = useApi('/admin/audit', { admin_email: adminEmail, entity, limit: LIMIT, offset })
  const byEmail = Object.fromEntries((admins.data || []).map((a) => [a.email, a]))

  return (
    <>
      <PageHeader title="Activity" sub="Every change made in the admin, by whom and when. Times are Lagos time (WAT)." />
      <Card>
        <div className="grid gap-3 border-b border-line p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-[16rem_12rem]">
          <Select aria-label="Admin" value={adminEmail} onChange={(e) => { setAdminEmail(e.target.value); setOffset(0) }}>
            <option value="">All admins</option>
            {(admins.data || []).map((a) => <option key={a.id} value={a.email}>{a.name || a.email}</option>)}
          </Select>
          <Select aria-label="Area" value={entity} onChange={(e) => { setEntity(e.target.value); setOffset(0) }}>
            <option value="">Everything</option>
            {ENTITIES.map((e) => <option key={e} value={e}>{humanize(e)}</option>)}
          </Select>
        </div>
        {error && <div className="p-4"><ErrorNote error={error} onRetry={reload} /></div>}
        {!data && !error ? <SkeletonRows rows={8} /> : data && (
          data.items.length ? (
            <div className={loading ? 'opacity-60 transition' : 'transition'}>
              <ul className="divide-y divide-line">
                {data.items.map((x) => <Row key={x.id} x={x} who={byEmail[x.admin_email] || {}} />)}
              </ul>
              <Pagination total={data.total} limit={LIMIT} offset={offset} onChange={setOffset} />
            </div>
          ) : <Empty icon={ActivityIcon} title="No activity yet" />
        )}
      </Card>
    </>
  )
}
