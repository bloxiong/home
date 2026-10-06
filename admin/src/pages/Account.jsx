import { useState } from 'react'
import { KeyRound } from 'lucide-react'
import { Badge, Button, Card, CardHeader, Field, Input, PageHeader, Star } from '../components/ui'
import { api } from '../lib/api'
import { useAuth, useToast } from '../lib/contexts'
import { fmtDate, PASSWORD_HINT, passwordProblem } from '../lib/format'

export default function Account() {
  const { admin, setSession } = useAuth()
  const toast = useToast()
  const [current, setCurrent] = useState('')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [touched, setTouched] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setTouched(true)
    if (!current || passwordProblem(pw) || pw !== pw2) return
    setBusy(true)
    setError('')
    try {
      const res = await api('/auth/change-password', { method: 'POST', body: { current_password: current, new_password: pw } })
      setSession(res)
      setCurrent(''); setPw(''); setPw2(''); setTouched(false)
      toast.success('Password changed. Other devices have been signed out.')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader title="Account" sub="Your admin profile and password." />
      <div className="grid items-start gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Profile" />
          <dl className="divide-y divide-line text-sm">
            {[
              ['Name', admin.name || '—'],
              ['Email', admin.email],
              ['Role', admin.is_super ? <Badge tone="gold"><Star className="h-3 w-3" /> super admin</Badge> : <Badge>admin</Badge>],
              ['Member since', fmtDate(admin.created_at)],
              ['Last sign in', fmtDate(admin.last_login_at)],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[8rem_1fr] gap-3 px-5 py-4 sm:px-6">
                <dt className="text-muted">{k}</dt><dd className="min-w-0 break-words">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="border-t border-line px-5 py-4 text-xs text-muted sm:px-6">To change your name or email, ask Owen or Austin.</p>
        </Card>

        <Card>
          <CardHeader title="Change password" sub="Changing it signs you out everywhere else." />
          <form onSubmit={submit} className="space-y-5 p-5 sm:p-6" noValidate>
            <input type="email" autoComplete="username" value={admin.email} readOnly hidden />
            <Field label="Current password" htmlFor="cur" error={touched && !current ? 'Enter your current password.' : null}>
              <Input id="cur" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
            </Field>
            <Field label="New password" htmlFor="npw" hint={PASSWORD_HINT} error={touched && passwordProblem(pw)}>
              <Input id="npw" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} />
            </Field>
            <Field label="Repeat new password" htmlFor="npw2" error={touched && pw !== pw2 ? 'The two passwords do not match.' : null}>
              <Input id="npw2" type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
            </Field>
            {error && <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
            <div className="flex justify-end">
              <Button type="submit" variant="primary" icon={KeyRound} loading={busy}>Change password</Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  )
}
