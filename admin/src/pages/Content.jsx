import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, FileText } from 'lucide-react'
import PublishButton from '../components/PublishButton'
import { Badge, Card, Empty, ErrorNote, PageHeader, SkeletonRows } from '../components/ui'
import { fmtDate, fmtRelative, humanize } from '../lib/format'
import { useApi } from '../lib/hooks'

export default function Content() {
  const nav = useNavigate()
  const { data, error, reload } = useApi('/admin/content')
  const sections = (data || []).filter((s) => !s.key.startsWith('_'))
  const pending = sections.filter((s) => s.has_changes).map((s) => s.key)

  return (
    <>
      <PageHeader title="Site content" sub="Edit the words and photos on bloxio.tech. Changes are drafts until you publish."
        actions={<PublishButton pending={pending} onDone={reload} />} />
      <ErrorNote error={error} onRetry={reload} />
      <Card>
        {!data && !error ? <SkeletonRows rows={8} /> : sections.length === 0 ? (
          <Empty icon={FileText} title="No content sections" />
        ) : (
          <ul className="divide-y divide-line">
            {sections.map((s) => (
              <li key={s.key} onClick={() => nav(`/content/${s.key}`)} className="flex cursor-pointer items-center gap-3 px-4 py-3.5 transition hover:bg-sunken sm:px-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link to={`/content/${s.key}`} onClick={(e) => e.stopPropagation()} className="font-bold">{humanize(s.key)}</Link>
                    <span className="font-mono text-[11px] text-muted">{s.key}</span>
                    {s.has_changes && <Badge tone="warn">unpublished changes</Badge>}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    Last edited by {s.updated_by || 'system'} · <span title={fmtDate(s.updated_at)}>{fmtRelative(s.updated_at)}</span>
                    {s.published_at && <> · published {fmtRelative(s.published_at)} by {s.published_by}</>}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted" aria-hidden />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  )
}
