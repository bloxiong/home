import { useState } from 'react'
import { Rocket } from 'lucide-react'
import { api } from '../lib/api'
import { useToast } from '../lib/contexts'
import { humanize } from '../lib/format'
import { Button, ConfirmDialog } from './ui'

/**
 * Publishes every section with draft changes, then the API triggers a site rebuild.
 * `pending` = keys with unpublished changes (to show in the confirm dialog).
 */
export default function PublishButton({ pending = [], blocked, onDone }) {
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)

  async function publish() {
    setBusy(true)
    try {
      const res = await api('/admin/content/publish', { method: 'POST' })
      setResult(res)
      if (res.published.length) toast.success(`Published ${res.published.map(humanize).join(', ')}.`)
      else toast.info('Nothing to publish.')
      onDone?.(res)
    } catch (e) {
      toast.error(e)
      setOpen(false)
    } finally {
      setBusy(false)
    }
  }

  const close = () => { setOpen(false); setResult(null) }

  return (
    <>
      <Button variant="primary" icon={Rocket} onClick={() => setOpen(true)} disabled={!pending.length && !blocked}
        title={pending.length ? undefined : 'No unpublished changes'}>
        Publish{pending.length ? ` (${pending.length})` : ''}
      </Button>
      <ConfirmDialog open={open} onClose={close} loading={busy}
        title={result ? 'Published' : 'Publish to the live site?'}
        confirmLabel={result ? 'Done' : blocked ? 'OK' : 'Publish now'}
        hideCancel={!!result || !!blocked}
        onConfirm={result || blocked ? close : publish}>
        {result ? (
          <div className="space-y-2">
            <p>{result.published.length ? <>Published <b>{result.published.map(humanize).join(', ')}</b>.</> : 'There was nothing to publish.'}</p>
            <p className="text-muted">Site deploy: <span className="font-mono text-ink">{result.deploy}</span></p>
          </div>
        ) : blocked ? (
          <p className="text-warn">{blocked}</p>
        ) : (
          <>
            <p>These sections will go live on bloxio.tech. The site rebuilds in a minute or two.</p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {pending.map((k) => <li key={k} className="rounded-lg border border-line bg-sunken px-2 py-0.5 text-xs font-bold">{humanize(k)}</li>)}
            </ul>
          </>
        )}
      </ConfirmDialog>
    </>
  )
}
