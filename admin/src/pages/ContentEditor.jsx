import { useCallback, useEffect, useState } from 'react'
import { useBlocker, useParams } from 'react-router-dom'
import { Lock, RotateCcw, Save, Undo2 } from 'lucide-react'
import AppearancePicker from '../components/AppearancePicker'
import JsonEditor from '../components/JsonEditor'
import PublishButton from '../components/PublishButton'
import { Badge, Button, Card, ConfirmDialog, Empty, ErrorNote, PageHeader, SkeletonRows } from '../components/ui'
import { api } from '../lib/api'
import { useToast } from '../lib/contexts'
import { fmtDate, fmtRelative, humanize } from '../lib/format'
import { useApi } from '../lib/hooks'

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)

function Editor({ sectionKey }) {
  const toast = useToast()
  const doc = useApi(`/admin/content/${sectionKey}`)
  const imgs = useApi('/admin/content/_IMAGES')
  const list = useApi('/admin/content')
  const [edit, setEdit] = useState(null) // local, unsaved edits (null = none)
  const [saving, setSaving] = useState(false)
  const [discardOpen, setDiscardOpen] = useState(false)
  const [discarding, setDiscarding] = useState(false)

  const d = doc.data
  const value = edit ?? d?.draft
  const dirty = edit !== null && d && !same(edit, d.draft)
  const images = imgs.data?.draft || {}
  const pending = (list.data || []).filter((s) => !s.key.startsWith('_') && s.has_changes).map((s) => s.key)

  // warn before leaving with unsaved edits (in-app navigation and tab close)
  const blocker = useBlocker(({ currentLocation, nextLocation }) => !!dirty && currentLocation.pathname !== nextLocation.pathname)
  useEffect(() => {
    if (!dirty) return
    const onUnload = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', onUnload)
    return () => window.removeEventListener('beforeunload', onUnload)
  }, [dirty])

  const save = useCallback(async () => {
    if (!dirty) return
    setSaving(true)
    try {
      const meta = await api(`/admin/content/${sectionKey}`, { method: 'PUT', body: { data: edit } })
      doc.setData((old) => ({ ...old, ...meta, draft: edit }))
      setEdit(null)
      list.reload()
      toast.success(`${humanize(sectionKey)} draft saved. Publish to put it live.`)
    } catch (e) {
      toast.error(e)
    } finally {
      setSaving(false)
    }
  }, [dirty, edit, sectionKey, doc, list, toast])

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); save() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [save])

  async function discard() {
    setDiscarding(true)
    try {
      await api(`/admin/content/${sectionKey}/discard`, { method: 'POST' })
      setEdit(null)
      doc.reload()
      list.reload()
      toast.success('Draft discarded. The section matches the live site again.')
      setDiscardOpen(false)
    } catch (e) {
      toast.error(e)
    } finally {
      setDiscarding(false)
    }
  }

  const back = { to: '/content', label: 'All sections' }
  const title = humanize(sectionKey)

  if (sectionKey.startsWith('_')) {
    return (
      <>
        <PageHeader title={title} back={back} />
        <Card><Empty icon={Lock} title="This section isn’t editable here">It is the photo library the other sections pick from.</Empty></Card>
      </>
    )
  }
  if (doc.error) return <><PageHeader title={title} back={back} /><ErrorNote error={doc.error} onRetry={doc.reload} /></>

  return (
    <>
      <PageHeader title={title} back={back}
        sub={d ? (
          <>
            Last edited by <b className="text-ink">{d.updated_by || 'system'}</b>, <span title={fmtDate(d.updated_at)}>{fmtRelative(d.updated_at)}</span>
            {d.published_at && <> · published by {d.published_by}, <span title={fmtDate(d.published_at)}>{fmtRelative(d.published_at)}</span></>}
          </>
        ) : 'Loading…'}
        actions={d && (
          <>
            {d.has_changes && !dirty && <Badge tone="warn">unpublished changes</Badge>}
            {d.has_changes && <Button variant="ghost" icon={RotateCcw} onClick={() => setDiscardOpen(true)}>Discard changes</Button>}
            <Button variant="secondary" icon={Save} disabled={!dirty} loading={saving} onClick={save}>Save draft</Button>
            <PublishButton pending={pending} blocked={dirty ? 'Save your draft first; unsaved edits are not published.' : null}
              onDone={() => { doc.reload(); list.reload() }} />
          </>
        )} />

      {!d ? <Card><SkeletonRows rows={10} /></Card> : (
        <Card className="p-4 sm:p-6">
          {sectionKey === 'APPEARANCE'
            ? <AppearancePicker value={value} onChange={setEdit} />
            : <JsonEditor sectionKey={sectionKey} value={value} images={images} onChange={setEdit} />}
        </Card>
      )}

      {dirty && (
        <div className="sticky bottom-20 z-20 mt-5 md:bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent/40 bg-surface/95 px-4 py-3 shadow-xl backdrop-blur">
          <p className="text-sm"><b>Unsaved edits</b> <span className="text-muted">· ⌘/Ctrl S to save</span></p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" icon={Undo2} onClick={() => setEdit(null)}>Revert edits</Button>
            <Button variant="primary" size="sm" icon={Save} loading={saving} onClick={save}>Save draft</Button>
          </div>
        </div>
      )}

      <ConfirmDialog open={discardOpen} danger title="Discard draft changes?" confirmLabel="Discard changes" loading={discarding}
        onConfirm={discard} onClose={() => setDiscardOpen(false)}>
        <p>This throws away every saved draft change to <b>{title}</b> and goes back to what is live on the site. It can’t be undone.</p>
      </ConfirmDialog>

      <ConfirmDialog open={blocker.state === 'blocked'} danger title="Leave without saving?" confirmLabel="Leave and lose edits" cancelLabel="Stay"
        onConfirm={() => blocker.proceed?.()} onClose={() => blocker.reset?.()}>
        <p>You have edits to <b>{title}</b> that aren’t saved yet.</p>
      </ConfirmDialog>
    </>
  )
}

export default function ContentEditor() {
  const { key } = useParams()
  return <Editor key={key} sectionKey={key} />
}
