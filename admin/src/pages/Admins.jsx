import { useState } from 'react'
import { Info, MailPlus, Trash2, UserPlus, Users } from 'lucide-react'
import { Badge, Button, Card, CardHeader, ConfirmDialog, Empty, ErrorNote, Field, Input, PageHeader, SkeletonRows, Star } from '../components/ui'
import { api } from '../lib/api'
import { useAuth, useToast } from '../lib/contexts'
import { fmtDate, fmtRelative } from '../lib/format'
import { useApi } from '../lib/hooks'

function AddAdmin({ onAdded }) {
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      const a = await api('/admin/admins', { method: 'POST', body: { email: email.trim(), name: name.trim() } })
      toast.success(`${a.email} added. A set-password link was emailed to them.`)
      setEmail('')
      setName('')
      onAdded()
    } catch (err) {
      toast.error(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <CardHeader title="Add admin" sub="They get an email with a link to choose their password (valid 72 hours)." />
      <form onSubmit={submit} className="grid gap-3 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-5">
        <Field label="Email" htmlFor="na-email"><Input id="na-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@bloxio.tech" /></Field>
        <Field label="Name" htmlFor="na-name"><Input id="na-name" value={name} maxLength={120} onChange={(e) => setName(e.target.value)} placeholder="Full name" /></Field>
        <Button type="submit" variant="primary" icon={UserPlus} loading={busy} disabled={!email.trim()}>Add admin</Button>
      </form>
    </Card>
  )
}

export default function Admins() {
  const { admin: me } = useAuth()
  const toast = useToast()
  const { data, error, reload } = useApi('/admin/admins')
  const [removing, setRemoving] = useState(null)
  const [busy, setBusy] = useState(null)
  const isSuper = !!me?.is_super
  const admins = (data || []).filter((a) => a.active)
  const removed = (data || []).filter((a) => !a.active)

  async function resend(a) {
    setBusy(a.id)
    try {
      await api(`/admin/admins/${a.id}/resend-invite`, { method: 'POST' })
      toast.success(`New set-password link sent to ${a.email}.`)
    } catch (e) {
      toast.error(e)
    } finally {
      setBusy(null)
    }
  }

  async function remove() {
    const a = removing
    setBusy(a.id)
    try {
      await api(`/admin/admins/${a.id}`, { method: 'DELETE' })
      toast.success(`${a.email} can no longer sign in.`)
      setRemoving(null)
      reload()
    } catch (e) {
      toast.error(e)
    } finally {
      setBusy(null)
    }
  }

  return (
    <>
      <PageHeader title="Admins" sub="Everyone who can sign in to this portal." />
      <div className="space-y-4">
        {isSuper ? <AddAdmin onAdded={reload} /> : (
          <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-muted">
            <Info className="h-4 w-4 shrink-0" aria-hidden /> Only Owen and Austin can add or remove admins.
          </div>
        )}
        <ErrorNote error={error} onRetry={reload} />
        <Card>
          <CardHeader title={`Admins${data ? ` · ${admins.length}` : ''}`} />
          {!data && !error ? <SkeletonRows rows={4} /> : admins.length === 0 ? <Empty icon={Users} title="No admins" /> : (
            <ul className="divide-y divide-line">
              {admins.map((a) => (
                <li key={a.id} className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:px-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-bold">{a.name || a.email}</span>
                      {a.is_super && <Badge tone="gold"><Star className="h-3 w-3" /> super admin</Badge>}
                      {!a.has_password && <Badge tone="warn">invite pending</Badge>}
                      {a.id === me?.id && <Badge>you</Badge>}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted">
                      {a.email} · {a.last_login_at ? <>last signed in <span title={fmtDate(a.last_login_at)}>{fmtRelative(a.last_login_at)}</span></> : 'never signed in'}
                      {a.created_by && a.created_by !== 'system' && <> · added by {a.created_by}</>}
                    </p>
                  </div>
                  {isSuper && (
                    <div className="flex shrink-0 gap-2">
                      {!a.has_password && <Button size="sm" icon={MailPlus} loading={busy === a.id && !removing} onClick={() => resend(a)}>Resend invite</Button>}
                      {!a.is_super && <Button size="sm" variant="danger" icon={Trash2} onClick={() => setRemoving(a)}>Remove</Button>}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
        {removed.length > 0 && (
          <Card>
            <CardHeader title="Removed" sub={isSuper ? 'Add them again above to restore access.' : undefined} />
            <ul className="divide-y divide-line">
              {removed.map((a) => (
                <li key={a.id} className="px-4 py-3 text-sm text-muted sm:px-5">{a.name ? `${a.name} · ` : ''}{a.email}</li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      <ConfirmDialog open={!!removing} danger title="Remove admin?" confirmLabel="Remove admin" loading={!!removing && busy === removing.id}
        onConfirm={remove} onClose={() => setRemoving(null)}>
        <p><b>{removing?.email}</b> will be signed out and won’t be able to sign in again. Their past activity stays in the log.</p>
      </ConfirmDialog>
    </>
  )
}
