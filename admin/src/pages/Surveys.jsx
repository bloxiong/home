import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ClipboardList, Download, Search, X } from 'lucide-react'
import { Badge, Button, Card, Empty, ErrorNote, Input, PageHeader, Pagination, Select, SkeletonRows, StatusBadge } from '../components/ui'
import { download } from '../lib/api'
import { useCounts, useToast } from '../lib/contexts'
import { RESPONDENT_TYPES, SURVEY_STATUSES } from '../lib/constants'
import { fmtDate, fmtRelative } from '../lib/format'
import { useApi, useDebounced } from '../lib/hooks'

const LIMIT = 25

export default function Surveys() {
  const [sp, setSp] = useSearchParams()
  const nav = useNavigate()
  const toast = useToast()
  const { counts } = useCounts()
  const [q, setQ] = useState(sp.get('q') || '')
  const dq = useDebounced(q)
  const status = sp.get('status') || ''
  const type = sp.get('type') || ''
  const updates = sp.get('updates') || ''
  const offset = Number(sp.get('offset') || 0)
  const [exporting, setExporting] = useState(false)

  const filters = { q: dq.trim(), status, respondent_type: type, wants_updates: updates }
  const { data, error, loading, reload } = useApi('/admin/surveys', { ...filters, limit: LIMIT, offset })

  const set = (k, v) => {
    const next = new URLSearchParams(sp)
    if (v) next.set(k, v)
    else next.delete(k)
    if (k !== 'offset') next.delete('offset')
    setSp(next, { replace: true })
  }
  // search box writes to the URL once typing settles
  const urlQ = sp.get('q') || ''
  useEffect(() => {
    if (urlQ === dq.trim()) return
    setSp((prev) => {
      const next = new URLSearchParams(prev)
      if (dq.trim()) next.set('q', dq.trim())
      else next.delete('q')
      next.delete('offset')
      return next
    }, { replace: true })
  }, [dq, urlQ, setSp])

  const types = Array.from(new Set([...RESPONDENT_TYPES, ...Object.keys(counts?.stats?.by_type || {}).filter((t) => t !== '—')]))
  const filtered = !!(dq || status || type || updates)

  async function exportCsv() {
    setExporting(true)
    try {
      await download('/admin/surveys/export.csv', filters, 'agrosense360-survey.csv')
      toast.success('CSV downloaded.')
    } catch (e) {
      toast.error(e)
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      <PageHeader title="Surveys" sub="AgroSense360 survey responses from the website."
        actions={<Button icon={Download} onClick={exportCsv} loading={exporting}>Export CSV</Button>} />

      <Card>
        <div className="grid gap-2 border-b border-line p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-[1fr_auto_auto_auto_auto]">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
            <Input type="search" placeholder="Search email, location, answers…" aria-label="Search surveys" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
          <Select aria-label="Status" value={status} onChange={(e) => set('status', e.target.value)}>
            <option value="">All statuses</option>
            {SURVEY_STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
          </Select>
          <Select aria-label="Respondent type" value={type} onChange={(e) => set('type', e.target.value)} className="lg:max-w-56">
            <option value="">All respondent types</option>
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Select aria-label="Wants updates" value={updates} onChange={(e) => set('updates', e.target.value)}>
            <option value="">Updates: any</option>
            <option value="true">Wants updates</option>
            <option value="false">No updates</option>
          </Select>
          {filtered && (
            <Button variant="ghost" icon={X} onClick={() => { setQ(''); setSp({}, { replace: true }) }}>Clear</Button>
          )}
        </div>

        {error && <div className="p-4"><ErrorNote error={error} onRetry={reload} /></div>}
        {!data && !error ? <SkeletonRows /> : data && (
          data.items.length === 0 ? (
            <Empty icon={ClipboardList} title={filtered ? 'No responses match' : 'No survey responses yet'}>
              {filtered ? 'Try clearing a filter.' : 'Responses from the AgroSense360 survey will appear here.'}
            </Empty>
          ) : (
            <div className={loading ? 'opacity-60 transition' : 'transition'}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-label text-muted">
                    <tr className="border-b border-line">
                      <th className="px-4 py-2.5 font-normal sm:px-5">#</th>
                      <th className="px-3 py-2.5 font-normal">Respondent</th>
                      <th className="hidden px-3 py-2.5 font-normal md:table-cell">Email</th>
                      <th className="hidden px-3 py-2.5 font-normal lg:table-cell">Rating</th>
                      <th className="hidden px-3 py-2.5 font-normal sm:table-cell">Submitted</th>
                      <th className="px-4 py-2.5 font-normal sm:px-5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {data.items.map((r) => (
                      <tr key={r.id} onClick={() => nav(`/surveys/${r.id}`)} className="cursor-pointer transition hover:bg-sunken">
                        <td className="px-4 py-3 font-mono text-xs text-muted sm:px-5">{r.id}</td>
                        <td className="w-full max-w-0 px-3 py-3">
                          <Link to={`/surveys/${r.id}`} onClick={(e) => e.stopPropagation()} className="block truncate font-bold">{r.respondent_type || 'Respondent'}</Link>
                          <span className="block truncate text-xs text-muted">{r.location || 'No location'}<span className="md:hidden">{r.email ? ` · ${r.email}` : ''}</span></span>
                        </td>
                        <td className="hidden max-w-56 px-3 py-3 md:table-cell md:max-w-56">
                          <span className="block truncate">{r.email || <span className="text-muted">—</span>}</span>
                          {r.wants_updates && <Badge tone="accent" className="mt-1">wants updates</Badge>}
                        </td>
                        <td className="hidden px-3 py-3 font-mono text-xs lg:table-cell">{r.data?.usefulnessRating ? `${r.data.usefulnessRating}/5` : '—'}</td>
                        <td className="hidden whitespace-nowrap px-3 py-3 text-xs text-muted sm:table-cell" title={fmtDate(r.created_at)}>{fmtRelative(r.created_at)}</td>
                        <td className="px-4 py-3 sm:px-5"><StatusBadge status={r.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination total={data.total} limit={LIMIT} offset={offset} onChange={(o) => set('offset', o ? String(o) : '')} />
            </div>
          )
        )}
      </Card>
    </>
  )
}
