import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckCircle2, ChevronDown, Inbox, Mail, Send, Users, X, XCircle } from 'lucide-react'
import EmailPreview from '../components/EmailPreview'
import {
  Badge, Button, Card, CardHeader, ConfirmDialog, Empty, ErrorNote, Field, Input, PageHeader, Pagination, Select,
  SkeletonRows, StatusBadge, Textarea, Toggle,
} from '../components/ui'
import { api } from '../lib/api'
import { useToast } from '../lib/contexts'
import { EMAIL_KINDS } from '../lib/constants'
import { fmtDate, fmtRelative, plural } from '../lib/format'
import { useApi } from '../lib/hooks'

const EMAIL_RE = /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/
const norm = (e) => e.trim().toLowerCase()

/** Free-entry address box: Enter, comma, space or paste adds addresses as chips. */
function AddressInput({ value, onChange }) {
  const [text, setText] = useState('')
  const [bad, setBad] = useState('')

  function commit(raw) {
    const parts = raw.split(/[\s,;]+/).map((s) => s.replace(/^<|>$/g, '')).filter(Boolean)
    if (!parts.length) return
    const good = parts.filter((p) => EMAIL_RE.test(p))
    const invalid = parts.filter((p) => !EMAIL_RE.test(p))
    const have = new Set(value.map(norm))
    onChange([...value, ...good.filter((g) => !have.has(norm(g)))])
    setText(invalid.join(' '))
    setBad(invalid.length ? `Not an email address: ${invalid.join(', ')}` : '')
  }

  return (
    <div>
      <div className="field flex min-h-10 flex-wrap items-center gap-1.5 !py-1.5" onClick={(e) => e.currentTarget.querySelector('input')?.focus()}>
        {value.map((a) => (
          <span key={a} className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface py-0.5 pl-2 pr-1 text-xs">
            {a}
            <button type="button" aria-label={`Remove ${a}`} onClick={() => onChange(value.filter((x) => x !== a))} className="rounded text-muted hover:text-ink">
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          </span>
        ))}
        <input
          aria-label="Add email addresses"
          className="min-w-40 flex-1 bg-transparent py-0.5 text-sm outline-none placeholder:text-muted/70"
          placeholder={value.length ? 'Add another…' : 'name@example.com — press Enter to add'}
          value={text}
          onChange={(e) => { setText(e.target.value); setBad('') }}
          onKeyDown={(e) => {
            if (['Enter', ',', ';', ' ', 'Tab'].includes(e.key) && text.trim()) {
              if (e.key !== 'Tab') e.preventDefault()
              commit(text)
            } else if (e.key === 'Backspace' && !text && value.length) {
              onChange(value.slice(0, -1))
            }
          }}
          onBlur={() => text.trim() && commit(text)}
          onPaste={(e) => {
            const t = e.clipboardData.getData('text')
            if (/[\s,;]/.test(t)) { e.preventDefault(); commit(text + t) }
          }}
        />
      </div>
      {bad && <p className="mt-1 text-xs text-danger">{bad}</p>}
    </div>
  )
}

function RecipientGroup({ title, icon: Icon, people, selected, onToggle, onAll }) {
  const [open, setOpen] = useState(false)
  const chosen = people.filter((p) => selected.has(norm(p.email))).length
  const all = people.length > 0 && chosen === people.length
  return (
    <div className="rounded-xl border border-line">
      <div className="flex items-center gap-2 px-3 py-2">
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm">
          <Icon className="h-4 w-4 shrink-0 text-muted" aria-hidden />
          <span className="font-bold">{title}</span>
          <span className="font-mono text-xs text-muted">{chosen}/{people.length}</span>
          <ChevronDown className={`ml-auto h-4 w-4 text-muted transition ${open ? 'rotate-180' : ''}`} aria-hidden />
        </button>
        <Button size="sm" variant="ghost" disabled={!people.length} onClick={() => onAll(people, !all)}>{all ? 'Clear' : 'Select all'}</Button>
      </div>
      {open && (
        people.length ? (
          <ul className="max-h-60 overflow-y-auto border-t border-line py-1">
            {people.map((p) => (
              <li key={p.email}>
                <label className="flex cursor-pointer items-center gap-3 px-3 py-1.5 text-sm hover:bg-ink/[0.035]">
                  <input type="checkbox" className="h-4 w-4 accent-[var(--bx-accent)]" checked={selected.has(norm(p.email))} onChange={() => onToggle(p.email)} />
                  <span className="min-w-0 flex-1 truncate">{p.email}</span>
                  <span className="hidden truncate text-xs text-muted sm:block">{p.label}</span>
                </label>
              </li>
            ))}
          </ul>
        ) : <p className="border-t border-line px-3 py-3 text-xs text-muted">Nobody here yet.</p>
      )}
    </div>
  )
}

function Compose({ onSent }) {
  const [sp] = useSearchParams()
  const toast = useToast()
  const recips = useApi('/admin/email/recipients')
  const [to, setTo] = useState(() => (sp.get('to') ? sp.get('to').split(',').filter((e) => EMAIL_RE.test(e)) : []))
  const [subject, setSubject] = useState(sp.get('subject') || '')
  const [body, setBody] = useState('')
  const [separate, setSeparate] = useState(true)
  const [confirm, setConfirm] = useState(false)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)

  const selected = useMemo(() => new Set(to.map(norm)), [to])
  const toggle = (email) => setTo((t) => (selected.has(norm(email)) ? t.filter((x) => norm(x) !== norm(email)) : [...t, email]))
  const setAll = (people, on) => setTo((t) => {
    if (!on) {
      const drop = new Set(people.map((p) => norm(p.email)))
      return t.filter((x) => !drop.has(norm(x)))
    }
    const have = new Set(t.map(norm))
    return [...t, ...people.map((p) => p.email).filter((e) => !have.has(norm(e)))]
  })

  const ready = to.length > 0 && subject.trim() && body.trim()

  async function send() {
    setSending(true)
    try {
      const res = await api('/admin/email/send', { method: 'POST', body: { to, subject: subject.trim(), body, separate } })
      setResult(res)
      setConfirm(false)
      if (res.failed) toast.error(`${plural(res.failed, 'email')} failed. See the results below.`)
      else toast.success(`${plural(res.sent, 'email')} ${res.results.every((r) => r.status === 'logged') ? 'logged' : 'sent'}.`)
      if (!res.failed) { setTo([]); setSubject(''); setBody('') }
      onSent()
    } catch (e) {
      toast.error(e)
      setConfirm(false)
    } finally {
      setSending(false)
    }
  }

  return (
    <Card>
      <CardHeader title="Compose" sub="Sent from the shared no-reply address. Replies go to the BLOXio inbox." />
      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_18rem]">
        <div className="min-w-0 space-y-3">
          <Field label={`To${to.length ? ` (${to.length})` : ''}`}>
            <AddressInput value={to} onChange={setTo} />
          </Field>
          <Field label="Subject" htmlFor="subj"><Input id="subj" value={subject} maxLength={300} onChange={(e) => setSubject(e.target.value)} /></Field>
          <Field label="Message" htmlFor="body" hint="Plain text. A blank line starts a new paragraph. It is wrapped in the BLOXio email design.">
            <Textarea id="body" rows={10} value={body} maxLength={20000} onChange={(e) => setBody(e.target.value)} />
          </Field>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Toggle checked={separate} onChange={setSeparate} label="Send separately" />
              <p className="mt-1 text-xs text-muted">{separate ? 'One email per person; nobody sees the other recipients.' : 'One email to everyone; all addresses are visible to each recipient.'}</p>
            </div>
            <Button variant="primary" icon={Send} disabled={!ready} loading={sending && !confirm}
              onClick={() => (to.length > 1 ? setConfirm(true) : send())}>
              Send{to.length > 1 ? ` to ${to.length}` : ''}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-label text-muted">Add recipients</p>
          {recips.error && <ErrorNote error={recips.error} onRetry={recips.reload} />}
          {!recips.data && !recips.error ? <SkeletonRows rows={2} /> : recips.data && (
            <>
              <RecipientGroup title="Updates list" icon={Users} people={recips.data.updates_list} selected={selected} onToggle={toggle} onAll={setAll} />
              <RecipientGroup title="Enquirers" icon={Inbox} people={recips.data.enquirers} selected={selected} onToggle={toggle} onAll={setAll} />
              <p className="px-1 text-xs text-muted">Only people who asked for updates or wrote to us are listed.</p>
            </>
          )}
        </div>
      </div>

      {result && (
        <div className="border-t border-line p-5 sm:p-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-bold">{result.sent} sent / logged · {result.failed} failed</p>
            <Button size="sm" variant="ghost" onClick={() => setResult(null)}>Dismiss</Button>
          </div>
          <ul className="space-y-1 text-sm">
            {result.results.map((r) => (
              <li key={r.id} className="flex items-start gap-2">
                {r.status === 'failed' ? <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />}
                <span className="min-w-0 flex-1 break-all">{r.to.join(', ')}</span>
                <StatusBadge status={r.status} />
                {r.error && <span className="w-full pl-6 text-xs text-danger">{r.error}</span>}
              </li>
            ))}
          </ul>
          {result.results.some((r) => r.status === 'logged') && (
            <p className="mt-2 text-xs text-muted">“Logged” means this server has no email key, so the message was recorded but not delivered.</p>
          )}
        </div>
      )}

      <ConfirmDialog open={confirm} title={`Send to ${to.length} people?`} confirmLabel={separate ? `Send ${to.length} emails` : 'Send one email'}
        loading={sending} onConfirm={send} onClose={() => setConfirm(false)}>
        <p>“<b>{subject}</b>” will go to <b>{plural(to.length, 'recipient')}</b>{separate ? ', each as their own email.' : ' in a single email where everyone can see each other’s address.'}</p>
        <ul className="mt-3 max-h-40 overflow-y-auto rounded-xl border border-line bg-sunken p-2 font-mono text-xs">
          {to.map((a) => <li key={a} className="truncate py-0.5">{a}</li>)}
        </ul>
      </ConfirmDialog>
    </Card>
  )
}

function LogRow({ m }) {
  const [open, setOpen] = useState(false)
  return (
    <li>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-ink/[0.035] sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{m.subject}</p>
          <p className="truncate text-xs text-muted">To {m.to.join(', ')}</p>
        </div>
        <div className="hidden shrink-0 text-right text-xs text-muted sm:block">
          <p>{m.sent_by || 'system'}</p>
          <p title={fmtDate(m.created_at)}>{fmtRelative(m.created_at)}</p>
        </div>
        <Badge className="hidden md:inline-flex">{m.kind}</Badge>
        <StatusBadge status={m.status} />
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted transition ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open && (
        <div className="space-y-2 px-5 pb-5 sm:px-6">
          <p className="text-xs text-muted">{m.kind} · {fmtDate(m.created_at)} · by {m.sent_by || 'system'}</p>
          {m.error && <p className="rounded-xl border border-danger/40 bg-danger/10 p-2 font-mono text-xs text-danger">{m.error}</p>}
          <EmailPreview html={m.body} />
        </div>
      )}
    </li>
  )
}

const LIMIT = 25

function Log({ tick }) {
  const [kind, setKind] = useState('')
  const [offset, setOffset] = useState(0)
  const { data, error, reload } = useApi('/admin/email/log', { kind, limit: LIMIT, offset })
  useEffect(() => { if (tick) reload() }, [tick, reload])
  return (
    <Card className="mt-4">
      <CardHeader title="Email log" sub="Everything the system and admins have sent."
        action={(
          <Select aria-label="Kind" value={kind} onChange={(e) => { setKind(e.target.value); setOffset(0) }} className="!h-8 !w-auto !py-1 text-xs">
            <option value="">All kinds</option>
            {EMAIL_KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
          </Select>
        )} />
      {error && <div className="p-4"><ErrorNote error={error} onRetry={reload} /></div>}
      {!data && !error ? <SkeletonRows /> : data && (
        data.items.length ? (
          <>
            <ul className="divide-y divide-line">{data.items.map((m) => <LogRow key={m.id} m={m} />)}</ul>
            <Pagination total={data.total} limit={LIMIT} offset={offset} onChange={setOffset} />
          </>
        ) : <Empty icon={Mail} title="No emails yet" />
      )}
    </Card>
  )
}

export default function Email() {
  const [tick, setTick] = useState(0)
  return (
    <>
      <PageHeader title="Email" sub="Write to people who asked to hear from BLOXio." />
      <Compose onSent={() => setTick((t) => t + 1)} />
      <Log tick={tick} />
    </>
  )
}
