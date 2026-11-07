import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Archive, CheckCircle2, Download, Mail, Paperclip, RotateCcw, Send } from 'lucide-react'
import TriagePanel from '../components/TriagePanel'
import { Button, Card, CardHeader, ErrorNote, Field, PageHeader, Skeleton, SkeletonRows, StatusBadge, Textarea } from '../components/ui'
import { api, download } from '../lib/api'
import { MAIL_STATUSES } from '../lib/constants'
import { useCounts, useToast } from '../lib/contexts'
import { fmtDate, fmtRelative } from '../lib/format'
import { useApi } from '../lib/hooks'

const SOURCE = { smtp: 'Sent from Gmail', portal: 'Sent from the portal', auto: 'Automatic reply' }

// earlier emails quoted at the bottom of a reply, which Gmail also hides
const QUOTE_CSS = '.gmail_quote,.gmail_attr,blockquote[type="cite"],.yahoo_quoted,#appendonsend,#divRplyFwdMsg{display:none!important}'
const HAS_QUOTE = /gmail_quote|type="?cite|yahoo_quoted|divRplyFwdMsg/
const TEXT_QUOTE = /^\s*(On .{5,200}wrote:|-{2,}\s*Original Message\s*-{2,}|From: .+\n(Sent|Date): )/m

/* The email as it was sent, in a sandbox: no scripts or forms, and links open in
   a new tab. allow-same-origin only lets us measure its height. */
function EmailFrame({ html, showQuoted }) {
  const ref = useRef(null)
  const [height, setHeight] = useState(160)
  // a meta refresh could send the frame to another page, which the sandbox doesn't stop
  const safe = html.replace(/<meta\b[^>]*http-equiv[^>]*>/gi, '')
  const doc = `<!doctype html><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; style-src 'unsafe-inline' https:; font-src https: data:"><base target="_blank"><style>body{margin:0;padding:16px;font:14px/1.6 Arial,Helvetica,sans-serif;color:#111;background:#fff;overflow-wrap:anywhere}img{max-width:100%;height:auto}${showQuoted ? '' : QUOTE_CSS}</style>${safe}`
  return (
    <iframe ref={ref} title="Email" sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox" srcDoc={doc} style={{ height }}
      className="block w-full border-0 bg-white"
      onLoad={() => {
        try {
          const h = ref.current?.contentDocument?.documentElement?.scrollHeight
          if (h) setHeight(h + 2)
        } catch { /* keep the default height */ }
      }} />
  )
}

function MailBody({ m }) {
  const [showQuoted, setShowQuoted] = useState(false)
  const quoted = m.html ? HAS_QUOTE.test(m.html) : TEXT_QUOTE.test(m.body || '')
  const text = quoted && !showQuoted ? (m.body || '').split(TEXT_QUOTE)[0].trim() : m.body
  return (
    <div>
      {m.html ? <EmailFrame html={m.html} showQuoted={showQuoted} /> : (
        <p className="whitespace-pre-wrap break-words px-5 py-4 text-[15px] leading-relaxed sm:px-6">
          {text || <span className="text-muted">{m.direction === 'out' ? 'Sent. The text of this reply is in Gmail.' : 'The text of this email is in Gmail.'}</span>}
        </p>
      )}
      {quoted && (
        <div className="px-5 py-2 sm:px-6">
          <button type="button" onClick={() => setShowQuoted((v) => !v)} aria-expanded={showQuoted} aria-label={showQuoted ? 'Hide earlier messages' : 'Show earlier messages'}
            className="rounded-md border border-line px-2 text-xs font-bold leading-5 text-muted transition hover:text-ink">•••</button>
        </div>
      )}
    </div>
  )
}

function fileSize(bytes) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function Attachments({ m, threadId }) {
  const toast = useToast()
  const files = m.files || []
  // anything we hold a file for can be downloaded; names without one were too large or are older mail
  const elsewhere = [...(m.attachments || [])]
  files.forEach((f) => { const i = elsewhere.indexOf(f.name); if (i >= 0) elsewhere.splice(i, 1) })
  async function save(f) {
    try {
      await download(`/admin/inbox/${threadId}/files/${f.id}`, undefined, f.name)
    } catch (e) {
      toast.error(e)
    }
  }
  return (
    <ul className="space-y-1 border-t border-line px-5 py-3.5 text-xs text-muted sm:px-6">
      {files.map((f) => (
        <li key={f.id}>
          <button type="button" onClick={() => save(f)} className="flex max-w-full items-center gap-2 break-all text-left font-bold text-accent hover:underline">
            <Download className="h-3.5 w-3.5 shrink-0" aria-hidden />{f.name}<span className="shrink-0 font-normal text-muted">{fileSize(f.size)}</span>
          </button>
        </li>
      ))}
      {elsewhere.map((a, i) => <li key={i} className="flex items-center gap-2 break-all"><Paperclip className="h-3.5 w-3.5 shrink-0" aria-hidden />{a}</li>)}
      {elsewhere.length > 0 && <li>{elsewhere.length === 1 ? 'This attachment is' : 'These attachments are'} only in Gmail.</li>}
    </ul>
  )
}

function Message({ m, startOpen, threadId }) {
  const [open, setOpen] = useState(startOpen)
  const out = m.direction === 'out'
  return (
    <li>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
        className="flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-ink/[0.035] sm:px-6">
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold">{m.from_name || (out ? 'BLOXio' : m.from_email)}</span>
          <span className="block truncate text-xs text-muted">
            {open ? `to ${(m.to || []).join(', ')}${out && SOURCE[m.source] ? ` · ${SOURCE[m.source]}` : ''}` : (m.snippet || m.subject)}
          </span>
        </span>
        <span className="shrink-0 text-xs text-muted" title={fmtDate(m.created_at)}>{fmtRelative(m.created_at)}</span>
      </button>
      {open && (
        <>
          <MailBody m={m} />
          {(m.attachments?.length > 0 || m.files?.length > 0) && <Attachments m={m} threadId={threadId} />}
        </>
      )}
    </li>
  )
}

function ReplyBox({ thread, onSent }) {
  const toast = useToast()
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)

  async function send() {
    setSending(true)
    try {
      onSent(await api(`/admin/inbox/${thread.id}/reply`, { method: 'POST', body: { body } }))
      setBody('')
      toast.success('Reply sent.')
    } catch (e) {
      toast.error(e)
    } finally {
      setSending(false)
    }
  }

  return (
    <Card>
      <CardHeader title="Reply" sub={`Sends from ${thread.mailbox} to ${thread.contact_email}. Replying from Gmail is tracked too.`} />
      <div className="space-y-4 p-5 sm:p-6">
        <Field label="Message" htmlFor="reply" hint="Plain text. Leave a blank line to start a new paragraph.">
          <Textarea id="reply" rows={7} value={body} onChange={(e) => setBody(e.target.value)} />
        </Field>
        <div className="flex justify-end">
          <Button variant="primary" icon={Send} loading={sending} disabled={!body.trim()} onClick={send}>Send reply</Button>
        </div>
      </div>
    </Card>
  )
}

export default function InboxThread() {
  const { id } = useParams()
  const toast = useToast()
  const { refresh } = useCounts()
  const { data: t, error, reload, setData } = useApi(`/admin/inbox/${id}`)

  // opening a new conversation counts as reviewing it; once per open, so it can still be set back to New
  const opened = useRef(null)
  useEffect(() => {
    if (t?.id !== Number(id) || t.status !== 'new' || opened.current === id) return
    opened.current = id
    api(`/admin/inbox/${id}`, { method: 'PATCH', body: { status: 'reviewed' } })
      .then((out) => { setData((d) => ({ ...d, ...out })); refresh() })
      .catch(() => { /* it stays New and can be set by hand */ })
  }, [t, id, setData, refresh])

  async function patch(body) {
    try {
      const out = await api(`/admin/inbox/${id}`, { method: 'PATCH', body })
      setData((d) => ({ ...d, ...out }))
      toast.success(body.status ? `Marked as ${body.status}.` : 'Notes saved.')
      refresh()
    } catch (e) {
      toast.error(e)
    }
  }

  const backQuery = new URLSearchParams({ ...(t?.mailbox ? { mailbox: t.mailbox } : {}), ...(t?.status === 'closed' ? { state: 'closed' } : {}), ...(t?.kind === 'platform' ? { kind: 'platform' } : {}) }).toString()
  const back = { to: backQuery ? `/inbox?${backQuery}` : '/inbox', label: 'Inbox' }
  async function sort(kind) {
    try {
      await api('/admin/inbox/sender/kind', { method: 'PUT', body: { mailbox: t.mailbox, email: t.contact_email, kind } })
      setData((d) => ({ ...d, kind }))
      toast.success(kind === 'platform' ? 'Moved to Platforms.' : 'Moved to People.')
      refresh()
    } catch (e) {
      toast.error(e)
    }
  }
  if (error) return <><PageHeader title="Conversation" back={back} /><ErrorNote error={error} onRetry={reload} /></>
  if (!t) {
    return (
      <>
        <PageHeader title="Conversation" back={back} />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]"><Card><SkeletonRows rows={8} /></Card><Skeleton className="h-64 rounded-2xl" /></div>
      </>
    )
  }

  return (
    <>
      <PageHeader title={t.subject || '(no subject)'} back={back}
        sub={<>{t.contact_name ? `${t.contact_name} · ` : ''}{t.contact_email} · in {t.mailbox}</>}
        actions={<StatusBadge status={t.status} />} />
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-5">
          <Card className="overflow-hidden">
            <ul className="divide-y divide-line">
              {t.messages.map((m, i) => <Message key={m.id} m={m} threadId={t.id} startOpen={i === t.messages.length - 1} />)}
            </ul>
          </Card>
          <ReplyBox key={t.id} thread={t} onSent={(d) => { setData(d); refresh() }} />
        </div>
        <div className="min-w-0 space-y-5 lg:sticky lg:top-6">
          <Card>
            <CardHeader title="Contact" />
            <div className="space-y-3 p-4 text-sm sm:p-5">
              <p className="flex items-center gap-2.5"><Mail className="h-4 w-4 shrink-0 text-muted" aria-hidden /><a className="min-w-0 break-all hover:underline" href={`mailto:${t.contact_email}`}>{t.contact_email}</a></p>
              <Link to={`/contacts/person?mailbox=${encodeURIComponent(t.mailbox)}&email=${encodeURIComponent(t.contact_email)}`} className="block text-xs font-bold text-accent hover:underline">All emails from this person</Link>
              {t.status !== 'replied' && t.status !== 'closed' && (
                <Button variant="secondary" icon={CheckCircle2} className="w-full" onClick={() => patch({ status: 'replied' })}>Mark as replied</Button>
              )}
              <Button variant="ghost" className="w-full" onClick={() => sort(t.kind === 'platform' ? 'person' : 'platform')}>{t.kind === 'platform' ? 'Move to People' : 'Move to Platforms'}</Button>
              {t.status === 'closed'
                ? <Button variant="secondary" icon={RotateCcw} className="w-full" onClick={() => patch({ status: 'reviewed' })}>Reopen conversation</Button>
                : <Button variant="ghost" icon={Archive} className="w-full" onClick={() => patch({ status: 'closed' })}>Close conversation</Button>}
            </div>
          </Card>
          <TriagePanel key={t.id} item={t} statuses={MAIL_STATUSES} onSave={patch} />
        </div>
      </div>
    </>
  )
}
