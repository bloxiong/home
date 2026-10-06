import { Link } from 'react-router-dom'
import { ArrowRight, BellRing, ClipboardList, Inbox, Sparkles, ThumbsUp } from 'lucide-react'
import { AnswerSplit, RankList } from '../components/charts'
import { Card, CardHeader, Empty, ErrorNote, PageHeader, Skeleton, Stat, StatusBadge } from '../components/ui'
import { useAuth } from '../lib/contexts'
import { topicLabel } from '../lib/constants'
import { fmtDate, fmtRelative } from '../lib/format'
import { useApi } from '../lib/hooks'

function greeting() {
  const h = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Lagos', hour: 'numeric', hour12: false }).format(new Date()))
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

function RecentList({ title, to, items, render, icon }) {
  return (
    <Card>
      <CardHeader title={title} action={<Link to={to} className="inline-flex items-center gap-1 text-xs font-bold text-accent hover:underline">View all <ArrowRight className="h-3 w-3" aria-hidden /></Link>} />
      {items.length ? <ul className="divide-y divide-line">{items.map(render)}</ul> : <Empty icon={icon} title="Nothing yet" />}
    </Card>
  )
}

export default function Dashboard() {
  const { admin } = useAuth()
  const { data: s, error, reload } = useApi('/admin/stats')
  const first = (admin?.name || '').split(' ')[0]

  return (
    <>
      <PageHeader title="Dashboard" sub={`${greeting()}${first ? `, ${first}` : ''}. Here is what has come in.`} />
      <ErrorNote error={error} onRetry={reload} />

      {!s && !error ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      ) : s && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5">
            <Stat icon={ClipboardList} label="Survey responses" value={s.surveys} to="/surveys" />
            <Stat icon={Sparkles} label="New surveys" value={s.surveys_new} sub="Not reviewed yet" to="/surveys?status=new" />
            <Stat icon={BellRing} label="Updates list" value={s.wants_updates} sub="Asked to hear from us" to="/email" />
            <Stat icon={Inbox} label="Enquiries" value={s.enquiries} sub={`${s.enquiries_new} new`} to="/enquiries" />
            <Stat icon={ThumbsUp} label="Avg usefulness" value={s.avg_usefulness != null ? `${s.avg_usefulness}/5` : '—'} sub="AgroSense360 rating" />
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            <Card className="lg:col-span-2 xl:col-span-1">
              <CardHeader title="Respondents by type" />
              <RankList unit="responses" emptyText="No answers yet." rows={Object.entries(s.by_type).map(([k, v]) => ({ key: k, label: k, value: v }))} />
            </Card>
            <Card><CardHeader title="Would consider using" sub="AgroSense360" /><AnswerSplit data={s.by_consider} question="Would consider using" /></Card>
            <Card><CardHeader title="Willing to pay" sub="If it delivers real value" /><AnswerSplit data={s.by_pay} question="Willing to pay" /></Card>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            <RecentList title="Recent surveys" to="/surveys" items={s.recent_surveys} icon={ClipboardList}
              render={(r) => (
                <li key={r.id}>
                  <Link to={`/surveys/${r.id}`} className="flex items-center gap-4 px-5 py-4 transition hover:bg-ink/[0.035] sm:px-6">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">{r.respondent_type || 'Respondent'}{r.location ? ` · ${r.location}` : ''}</span>
                      <span className="block truncate text-xs text-muted">{r.email || 'No email given'}</span>
                    </span>
                    <span className="hidden text-xs text-muted sm:block" title={fmtDate(r.created_at)}>{fmtRelative(r.created_at)}</span>
                    <StatusBadge status={r.status} />
                  </Link>
                </li>
              )} />
            <RecentList title="Recent enquiries" to="/enquiries" items={s.recent_enquiries} icon={Inbox}
              render={(e) => (
                <li key={e.id}>
                  <Link to={`/enquiries/${e.id}`} className="flex items-center gap-4 px-5 py-4 transition hover:bg-ink/[0.035] sm:px-6">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">{e.name}{e.org ? ` · ${e.org}` : ''}</span>
                      <span className="block truncate text-xs text-muted">{topicLabel(e.topic)} · {e.message}</span>
                    </span>
                    <span className="hidden text-xs text-muted sm:block" title={fmtDate(e.created_at)}>{fmtRelative(e.created_at)}</span>
                    <StatusBadge status={e.status} />
                  </Link>
                </li>
              )} />
          </div>
        </>
      )}
    </>
  )
}
