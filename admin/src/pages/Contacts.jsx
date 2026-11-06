import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Check, Mail, Pencil, Plus, Trash2, X } from 'lucide-react'
import { Button, Card, ConfirmDialog, Empty, ErrorNote, Input, PageHeader, Pagination, SearchInput, Select, SkeletonRows, StatusBadge } from '../components/ui'
import { api } from '../lib/api'
import { MAIL_STATUSES } from '../lib/constants'
import { useToast } from '../lib/contexts'
import { fmtDate, fmtRelative } from '../lib/format'
import { useApi, useDebounced } from '../lib/hooks'

const LIMIT = 25
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

function Tab({ active, onClick, label, count }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={`inline-flex max-w-full shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${active ? 'border-accent bg-accent text-on-accent' : 'border-line text-muted hover:text-ink'}`}>
      <span className="truncate">{label}</span>
      <span className={`font-mono text-xs ${active ? '' : 'text-muted'}`}>{count}</span>
    </button>
  )
}

export default function Contacts() {
  const [sp, setSp] = useSearchParams()
  const nav = useNavigate()
  const toast = useToast()
  const [q, setQ] = useState('')
  const dq = useDebounced(q)
  const status = sp.get('status') || ''
  const mailbox = sp.get('mailbox') || ''
  const section = sp.get('section') || ''
  const offset = Number(sp.get('offset') || 0)
  const { data, error, loading, reload } = useApi('/admin/inbox/senders', { q: dq.trim(), status, mailbox, section, limit: LIMIT, offset })
  const [adding, setAdding] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [name, setName] = useState('')
  const [removing, setRemoving] = useState(false)
  const [busy, setBusy] = useState(false)

  const set = (k, v) => {
    const next = new URLSearchParams(sp)
    if (v) next.set(k, v)
    else next.delete(k)
    if (k !== 'offset') next.delete('offset')
    setSp(next, { replace: true })
  }
  const filtered = !!(dq || status || mailbox)
  const mailboxes = data?.mailboxes || []
  const sections = data?.sections || []
  const current = sections.find((s) => String(s.id) === section)

  // a section removed elsewhere shouldn't leave the page on an empty tab
  useEffect(() => {
    if (data && section && section !== 'none' && !current) set('section', '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, section, current])

  async function saveName() {
    setBusy(true)
    try {
      const made = renaming
        ? await api(`/admin/inbox/sections/${current.id}`, { method: 'PATCH', body: { name } })
        : await api('/admin/inbox/sections', { method: 'POST', body: { name } })
      setAdding(false); setRenaming(false); setName('')
      if (!renaming) set('section', String(made.id))
      reload()
    } catch (e) {
      toast.error(e)
    } finally {
      setBusy(false)
    }
  }
  async function remove() {
    setBusy(true)
    try {
      await api(`/admin/inbox/sections/${current.id}`, { method: 'DELETE' })
      toast.success(`${current.name} removed. Its contacts are now in Unsorted.`)
      setRemoving(false)
      set('section', '')
      reload()
    } catch (e) {
      toast.error(e)
    } finally {
      setBusy(false)
    }
  }
  async function file(row, value) {
    try {
      await api('/admin/inbox/sender/section', { method: 'PUT', body: { mailbox: row.mailbox, email: row.email, section_id: value ? Number(value) : null } })
      reload()
    } catch (e) {
      toast.error(e)
    }
  }

  return (
    <>
      <PageHeader title="Contacts" sub="Everyone who has emailed your BLOXio mailboxes, once each, filed by section." />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Tab active={!section} onClick={() => set('section', '')} label="All" count={data?.all ?? '–'} />
        {sections.map((s) => <Tab key={s.id} active={String(s.id) === section} onClick={() => set('section', String(s.id))} label={s.name} count={s.count} />)}
        <Tab active={section === 'none'} onClick={() => set('section', 'none')} label="Unsorted" count={data?.uncategorised ?? '–'} />
        {!adding && !renaming && <Button variant="ghost" size="sm" icon={Plus} onClick={() => { setName(''); setAdding(true) }}>New section</Button>}
        {current && !adding && !renaming && (
          <>
            <Button variant="ghost" size="sm" icon={Pencil} onClick={() => { setName(current.name); setRenaming(true) }}>Rename</Button>
            <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setRemoving(true)}>Remove</Button>
          </>
        )}
      </div>
      {(adding || renaming) && (
        <form className="mb-4 flex flex-wrap items-center gap-2" onSubmit={(e) => { e.preventDefault(); saveName() }}>
          <Input autoFocus className="min-w-0 flex-1 sm:max-w-xs" aria-label="Section name" placeholder="Section name" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
          <Button type="submit" variant="primary" size="sm" icon={Check} loading={busy} disabled={!name.trim()}>{renaming ? 'Save' : 'Add section'}</Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => { setAdding(false); setRenaming(false) }}>Cancel</Button>
        </form>
      )}
      <Card>
        <div className="grid grid-cols-1 gap-3 border-b border-line p-4 min-[360px]:grid-cols-2 sm:p-5 lg:grid-cols-[1fr_auto_auto_auto]">
          <SearchInput className="min-[360px]:col-span-2 lg:col-span-1" placeholder="Search name, email, subject, message…" aria-label="Search contacts" value={q} onChange={(e) => setQ(e.target.value)} />
          {mailboxes.length > 1 && (
            <Select aria-label="Mailbox" value={mailbox} onChange={(e) => set('mailbox', e.target.value)}>
              <option value="">All mailboxes</option>
              {mailboxes.map((m) => <option key={m} value={m}>{m}</option>)}
            </Select>
          )}
          <Select aria-label="Status" value={status} onChange={(e) => set('status', e.target.value)}>
            <option value="">All statuses</option>
            {MAIL_STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
          </Select>
          {filtered && <Button variant="ghost" icon={X} onClick={() => { setQ(''); const next = new URLSearchParams(section ? { section } : {}); setSp(next, { replace: true }) }}>Clear</Button>}
        </div>
        {error && <div className="p-4"><ErrorNote error={error} onRetry={reload} /></div>}
        {!data && !error ? <SkeletonRows /> : data && (
          data.items.length === 0 ? (
            <Empty icon={Mail} title={filtered ? 'No contacts match' : 'No contacts here yet'}>
              {filtered ? 'Try clearing a filter.' : section ? 'File someone here from the All tab.' : 'Email to your mailboxes will appear here.'}
            </Empty>
          ) : (
            <div className={loading ? 'opacity-60 transition' : 'transition'}>
              <ul className="divide-y divide-line">
                {data.items.map((r) => {
                  const to = `/contacts/person?mailbox=${encodeURIComponent(r.mailbox)}&email=${encodeURIComponent(r.email)}`
                  return (
                    <li key={`${r.mailbox}|${r.email}`} onClick={() => nav(to)} className="flex cursor-pointer flex-wrap items-start gap-x-3 gap-y-2 px-5 py-4 transition hover:bg-ink/[0.035] sm:px-6">
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${r.new ? 'bg-accent' : 'bg-transparent'}`} aria-hidden />
                      <div className="min-w-0 flex-1 basis-40">
                        <Link to={to} onClick={(ev) => ev.stopPropagation()} className={`block truncate ${r.new ? 'font-bold' : 'font-medium'}`}>{r.name || r.email}</Link>
                        {r.name && <p className="truncate text-xs text-muted">{r.email}</p>}
                        {mailboxes.length > 1 && <p className="truncate text-xs text-accent">{r.mailbox}</p>}
                        <p className="mt-0.5 truncate text-sm">{r.last_subject || '(no subject)'}</p>
                        <p className="truncate text-xs text-muted">{plural(r.emails, 'email')}{r.conversations > 1 ? ` · ${plural(r.conversations, 'conversation')}` : ''}</p>
                      </div>
                      <div className="flex shrink-0 items-start gap-3" onClick={(ev) => ev.stopPropagation()}>
                        <Select aria-label={`Section for ${r.name || r.email}`} className="w-36" value={r.section_id ?? ''} onChange={(e) => file(r, e.target.value)}>
                          <option value="">Unsorted</option>
                          {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </Select>
                        <div className="flex flex-col items-end gap-1">
                          <StatusBadge status={r.status} />
                          <span className="text-xs text-muted" title={fmtDate(r.last_at)}>{fmtRelative(r.last_at)}</span>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
              <Pagination total={data.total} limit={LIMIT} offset={offset} onChange={(o) => set('offset', o ? String(o) : '')} />
            </div>
          )
        )}
      </Card>
      <ConfirmDialog open={removing} danger title={`Remove ${current?.name || 'section'}?`} confirmLabel="Remove section" loading={busy}
        onConfirm={remove} onClose={() => setRemoving(false)}>
        Its contacts and their emails stay. They move to Unsorted.
      </ConfirmDialog>
    </>
  )
}
