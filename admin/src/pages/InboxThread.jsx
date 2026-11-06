import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle2, Mail, Paperclip, Send } from 'lucide-react'
import TriagePanel from '../components/TriagePanel'
import { Button, Card, CardHeader, ErrorNote, Field, PageHeader, Skeleton, SkeletonRows, StatusBadge, Textarea } from '../components/ui'
import { api } from '../lib/api'
import { MAIL_STATUSES } from '../lib/constants'
import { useCounts, useToast } from '../lib/contexts'
import { fmtDate, fmtRelative } from '../lib/format'
import { useApi } from '../lib/hooks'

const SOURCE = { smtp: 'Sent from Gmail', portal: 'Sent from the portal' }

function Message({ m }) {
  const out = m.direction === 'out'
  return (
    <Card className={out ? 'border-accent/40' : ''}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-line px-5 py-3.5 sm:px-6">
        <p className="min-w-0 break-words text-sm font-bold">{out ? (m.sent_by || 'BLOXio') : (m.from_name || m.from_email)}</p>
        <p className="text-xs text-muted" title={fmtDate(m.created_at)}>{out ? `${SOURCE[m.source] || 'Sent'} · ` : ''}{fmtRelative(m.created_at)}</p>
      </div>
      <p className="whitespace-pre-wrap break-words p-5 text-[15px] leading-relaxed sm:p-6">
        {m.body || <span className="text-muted">{out ? 'Sent. The text of this reply is in Gmail.' : 'This email had no text. Open it in Gmail.'}</span>}
      </p>
      {m.attachments?.length > 0 && (
        <ul className="space-y-1 border-t border-line px-5 py-3.5 text-xs text-muted sm:px-6">
          {m.attachments.map((a, i) => <li key={i} className="flex items-center gap-2 break-all"><Paperclip className="h-3.5 w-3.5 shrink-0" aria-hidden />{a}</li>)}
          <li>Attachments stay in Gmail.</li>
        </ul>
      )}
    </Card>
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
      <CardHeader title="Reply" sub={`Sends from contact@bloxio.tech to ${thread.contact_email}. Replying from Gmail is tracked too.`} />
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

  const back = { to: '/inbox', label: 'Inbox' }
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
        sub={<>{t.contact_name ? `${t.contact_name} · ` : ''}{t.contact_email}</>}
        actions={<StatusBadge status={t.status} />} />
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-5">
          {t.messages.map((m) => <Message key={m.id} m={m} />)}
          <ReplyBox key={t.id} thread={t} onSent={(d) => { setData(d); refresh() }} />
        </div>
        <div className="min-w-0 space-y-5 lg:sticky lg:top-6">
          <Card>
            <CardHeader title="Contact" />
            <div className="space-y-3 p-4 text-sm sm:p-5">
              <p className="flex items-center gap-2.5"><Mail className="h-4 w-4 shrink-0 text-muted" aria-hidden /><a className="min-w-0 break-all hover:underline" href={`mailto:${t.contact_email}`}>{t.contact_email}</a></p>
              {t.status !== 'replied' && (
                <Button variant="secondary" icon={CheckCircle2} className="w-full" onClick={() => patch({ status: 'replied' })}>Mark as replied</Button>
              )}
            </div>
          </Card>
          <TriagePanel key={t.id} item={t} statuses={MAIL_STATUSES} onSave={patch} />
        </div>
      </div>
    </>
  )
}
