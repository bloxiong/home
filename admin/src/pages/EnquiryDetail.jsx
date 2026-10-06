import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Building2, ChevronDown, Mail, Phone, Send } from 'lucide-react'
import EmailPreview from '../components/EmailPreview'
import TriagePanel from '../components/TriagePanel'
import { Badge, Button, Card, CardHeader, ErrorNote, Field, Input, PageHeader, Skeleton, SkeletonRows, StatusBadge, Textarea } from '../components/ui'
import { api } from '../lib/api'
import { useCounts, useToast } from '../lib/contexts'
import { ENQUIRY_STATUSES, topicLabel } from '../lib/constants'
import { fmtDate, fmtRelative } from '../lib/format'
import { useApi } from '../lib/hooks'

function Reply({ enquiry, onSent }) {
  const toast = useToast()
  const first = enquiry.name.split(' ')[0]
  const [subject, setSubject] = useState(`Re: ${topicLabel(enquiry.topic)}`)
  const [body, setBody] = useState(`Hi ${first},\n\n\n\nBest regards,\nThe BLOXio team`)
  const [sending, setSending] = useState(false)

  async function send() {
    setSending(true)
    try {
      const res = await api('/admin/email/send', {
        method: 'POST',
        body: { to: [enquiry.email], subject: subject.trim(), body, enquiry_id: enquiry.id, separate: true },
      })
      const r = res.results?.[0]
      if (res.failed) toast.error(`Email failed: ${r?.error || 'unknown error'}`)
      else toast.success(r?.status === 'logged' ? 'Reply logged (email sending is off on this server).' : `Reply sent to ${enquiry.email}.`)
      if (!res.failed) setBody(`Hi ${first},\n\n\n\nBest regards,\nThe BLOXio team`)
      onSent()
    } catch (e) {
      toast.error(e)
    } finally {
      setSending(false)
    }
  }

  return (
    <Card>
      <CardHeader title="Reply" sub={`From the no-reply address; replies to it go to the BLOXio inbox. Sending marks this enquiry replied.`} />
      <div className="space-y-5 p-5 sm:p-6">
        <Field label="To"><Input value={`${enquiry.name} <${enquiry.email}>`} readOnly className="opacity-80" /></Field>
        <Field label="Subject" htmlFor="rs"><Input id="rs" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={300} /></Field>
        <Field label="Message" htmlFor="rb" hint="Plain text. Leave a blank line to start a new paragraph.">
          <Textarea id="rb" rows={9} value={body} onChange={(e) => setBody(e.target.value)} />
        </Field>
        <div className="flex justify-end">
          <Button variant="primary" icon={Send} loading={sending} disabled={!subject.trim() || !body.trim()} onClick={send}>Send reply</Button>
        </div>
      </div>
    </Card>
  )
}

function EmailItem({ m }) {
  const [open, setOpen] = useState(false)
  return (
    <li>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-ink/[0.035] sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{m.subject}</p>
          <p className="truncate text-xs text-muted">{m.kind} · {m.sent_by || 'system'} · <span title={fmtDate(m.created_at)}>{fmtRelative(m.created_at)}</span></p>
        </div>
        <StatusBadge status={m.status} />
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted transition ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open && <div className="px-5 pb-5 sm:px-6"><EmailPreview html={m.body} /></div>}
    </li>
  )
}

export default function EnquiryDetail() {
  const { id } = useParams()
  const toast = useToast()
  const { refresh } = useCounts()
  const { data: e, error, reload, setData } = useApi(`/admin/enquiries/${id}`)

  async function patch(body) {
    try {
      const out = await api(`/admin/enquiries/${id}`, { method: 'PATCH', body })
      setData((d) => ({ ...d, ...out }))
      toast.success(body.status ? `Marked as ${body.status}.` : 'Notes saved.')
      refresh()
    } catch (err) {
      toast.error(err)
    }
  }

  const back = { to: '/enquiries', label: 'All enquiries' }
  if (error) return <><PageHeader title="Enquiry" back={back} /><ErrorNote error={error} onRetry={reload} /></>
  if (!e) {
    return (
      <>
        <PageHeader title="Enquiry" back={back} />
        <div className="grid gap-4 lg:grid-cols-[1fr_20rem]"><Card><SkeletonRows rows={8} /></Card><Skeleton className="h-64 rounded-2xl" /></div>
      </>
    )
  }

  return (
    <>
      <PageHeader title={e.name} back={back}
        sub={<>{topicLabel(e.topic)} · received <span title={fmtDate(e.created_at)}>{fmtRelative(e.created_at)}</span></>}
        actions={<StatusBadge status={e.status} />} />
      <div className="grid items-start gap-5 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-5">
          <Card>
            <CardHeader title="Message" sub={fmtDate(e.created_at)} />
            <p className="whitespace-pre-wrap break-words p-4 text-[15px] leading-relaxed sm:p-5">{e.message}</p>
          </Card>
          <Reply key={e.id} enquiry={e} onSent={() => { reload(); refresh() }} />
          <Card>
            <CardHeader title="Emails with this person" sub="Includes the automatic confirmation they received." />
            {e.emails?.length ? (
              <ul className="divide-y divide-line">{e.emails.map((m) => <EmailItem key={m.id} m={m} />)}</ul>
            ) : <p className="p-5 text-sm text-muted">No emails yet.</p>}
          </Card>
        </div>
        <div className="space-y-5 lg:sticky lg:top-6">
          <Card>
            <CardHeader title="Contact" />
            <ul className="space-y-2.5 p-4 text-sm sm:p-5">
              <li className="flex items-center gap-2.5"><Mail className="h-4 w-4 shrink-0 text-muted" aria-hidden /><a className="break-all hover:underline" href={`mailto:${e.email}`}>{e.email}</a></li>
              {e.phone && <li className="flex items-center gap-2.5"><Phone className="h-4 w-4 shrink-0 text-muted" aria-hidden /><a className="hover:underline" href={`tel:${e.phone.replace(/\s+/g, '')}`}>{e.phone}</a></li>}
              {e.org && <li className="flex items-center gap-2.5"><Building2 className="h-4 w-4 shrink-0 text-muted" aria-hidden />{e.org}</li>}
              <li><Badge>{topicLabel(e.topic)}</Badge></li>
            </ul>
          </Card>
          <TriagePanel key={e.id} item={e} statuses={ENQUIRY_STATUSES} onSave={patch} />
        </div>
      </div>
    </>
  )
}
