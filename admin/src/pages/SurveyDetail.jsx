import { useParams } from 'react-router-dom'
import { Mail } from 'lucide-react'
import TriagePanel from '../components/TriagePanel'
import { Badge, Button, Card, CardHeader, Chips, ErrorNote, PageHeader, Skeleton, SkeletonRows } from '../components/ui'
import { api } from '../lib/api'
import { useCounts, useToast } from '../lib/contexts'
import { SURVEY_STATUSES } from '../lib/constants'
import { fmtDate, fmtRelative, humanize } from '../lib/format'
import { useApi } from '../lib/hooks'

function Answer({ value }) {
  if (Array.isArray(value)) return value.length ? <Chips items={value} /> : <span className="text-muted">—</span>
  if (value === null || value === undefined || value === '') return <span className="text-muted">—</span>
  if (typeof value === 'object') return <pre className="whitespace-pre-wrap font-mono text-xs">{JSON.stringify(value, null, 2)}</pre>
  return <span className="whitespace-pre-wrap break-words">{String(value)}</span>
}

export default function SurveyDetail() {
  const { id } = useParams()
  const toast = useToast()
  const { refresh } = useCounts()
  const { data: s, error, reload, setData } = useApi(`/admin/surveys/${id}`)

  async function patch(body) {
    try {
      const out = await api(`/admin/surveys/${id}`, { method: 'PATCH', body })
      setData((d) => ({ ...d, ...out }))
      toast.success(body.status ? `Marked as ${body.status}.` : 'Notes saved.')
      refresh()
    } catch (e) {
      toast.error(e)
    }
  }

  const back = { to: '/surveys', label: 'All surveys' }
  if (error) return <><PageHeader title={`Survey #${id}`} back={back} /><ErrorNote error={error} onRetry={reload} /></>
  if (!s) {
    return (
      <>
        <PageHeader title={`Survey #${id}`} back={back} />
        <div className="grid gap-4 lg:grid-cols-[1fr_20rem]"><Card><SkeletonRows rows={10} /></Card><Skeleton className="h-64 rounded-2xl" /></div>
      </>
    )
  }

  const labels = s.labels || {}
  const keys = [...Object.keys(labels), ...Object.keys(s.data || {}).filter((k) => !(k in labels))]
  const subject = 'About your AgroSense360 survey answers'

  return (
    <>
      <PageHeader
        title={`Survey #${s.id}`}
        back={back}
        sub={<>{s.respondent_type || 'Respondent'}{s.location ? ` · ${s.location}` : ''} · submitted <span title={fmtDate(s.created_at)}>{fmtRelative(s.created_at)}</span></>}
        actions={s.email && (
          <Button variant="primary" icon={Mail} to={`/email?to=${encodeURIComponent(s.email)}&subject=${encodeURIComponent(subject)}`}>
            Email this person
          </Button>
        )}
      />
      <div className="grid items-start gap-5 lg:grid-cols-[1fr_20rem]">
        <Card>
          <CardHeader title="Answers" sub={fmtDate(s.created_at)} />
          <dl className="divide-y divide-line">
            {keys.map((k) => (
              <div key={k} className="grid gap-1 px-5 py-4 sm:grid-cols-[14rem_1fr] sm:gap-6 sm:px-6">
                <dt className="text-sm text-muted">{labels[k] || humanize(k)}</dt>
                <dd className="text-sm"><Answer value={s.data?.[k]} /></dd>
              </div>
            ))}
          </dl>
        </Card>

        <div className="space-y-5 lg:sticky lg:top-6">
          <TriagePanel key={s.id} item={s} statuses={SURVEY_STATUSES} onSave={patch} />
          <Card>
            <CardHeader title="Contact" />
            <div className="space-y-2 p-4 text-sm sm:p-5">
              <p className="break-all">{s.email || <span className="text-muted">No email given</span>}</p>
              <div className="flex flex-wrap gap-1.5">
                {s.wants_updates ? <Badge tone="accent">wants updates</Badge> : <Badge>no updates</Badge>}
                <Badge>source: {s.source}</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
