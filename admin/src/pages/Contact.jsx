import { Link, useSearchParams } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { Card, CardHeader, Empty, ErrorNote, Field, PageHeader, Select, Skeleton, SkeletonRows, StatusBadge } from '../components/ui'
import { api } from '../lib/api'
import { useToast } from '../lib/contexts'
import { fmtDate, fmtRelative } from '../lib/format'
import { useApi } from '../lib/hooks'

export default function Contact() {
  const [sp] = useSearchParams()
  const mailbox = sp.get('mailbox') || ''
  const email = sp.get('email') || ''
  const toast = useToast()
  const { data: s, error, reload, setData } = useApi('/admin/inbox/sender', { mailbox, email })
  const back = { to: '/contacts', label: 'Contacts' }

  async function file(value) {
    try {
      const out = await api('/admin/inbox/sender/section', { method: 'PUT', body: { mailbox, email, section_id: value ? Number(value) : null } })
      setData((d) => ({ ...d, section_id: out.section_id }))
    } catch (e) {
      toast.error(e)
    }
  }

  if (error) return <><PageHeader title="Contact" back={back} /><ErrorNote error={error} onRetry={reload} /></>
  if (!s) {
    return (
      <>
        <PageHeader title="Contact" back={back} />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]"><Card><SkeletonRows rows={6} /></Card><Skeleton className="h-40 rounded-2xl" /></div>
      </>
    )
  }

  return (
    <>
      <PageHeader title={s.name || s.email} back={back} sub={<>{s.name ? `${s.email} · ` : ''}in {s.mailbox}</>} actions={<StatusBadge status={s.status} />} />
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="min-w-0">
          <CardHeader title="Emails" sub={`${s.emails} in ${s.conversations} conversation${s.conversations === 1 ? '' : 's'}`} />
          {s.threads.length === 0 ? <Empty icon={Mail} title="No emails" /> : (
            <ul className="divide-y divide-line">
              {s.threads.map((t) => (
                <li key={t.id}>
                  <Link to={`/inbox/${t.id}`} className="flex items-start gap-3 px-5 py-4 transition hover:bg-ink/[0.035] sm:px-6">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${t.status === 'new' ? 'bg-accent' : 'bg-transparent'}`} aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate ${t.status === 'new' ? 'font-bold' : 'font-medium'}`}>{t.subject || '(no subject)'}{t.count > 1 && <span className="font-normal text-muted"> · {t.count}</span>}</span>
                      <span className="block truncate text-xs text-muted">{t.snippet || 'The text of this email is in Gmail.'}</span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      <StatusBadge status={t.status} />
                      <span className="text-xs text-muted" title={fmtDate(t.last_message_at)}>{fmtRelative(t.last_message_at)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card className="min-w-0">
          <CardHeader title="Section" />
          <div className="p-4 sm:p-5">
            <Field label="Filed under" htmlFor="section">
              <Select id="section" value={s.section_id ?? ''} onChange={(e) => file(e.target.value)}>
                <option value="">Unsorted</option>
                {s.sections.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
              </Select>
            </Field>
          </div>
        </Card>
      </div>
    </>
  )
}
