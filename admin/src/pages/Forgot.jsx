import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import AuthShell from '../components/AuthShell'
import { Button, Field, Input } from '../components/ui'
import { api } from '../lib/api'

export default function Forgot() {
  const loc = useLocation()
  const [email, setEmail] = useState(loc.state?.email || '')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api('/auth/forgot', { method: 'POST', body: { email: email.trim() }, auth: false })
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (sent) {
    return (
      <AuthShell title="Check your email">
        <div className="flex gap-3 text-sm">
          <MailCheck className="h-5 w-5 shrink-0 text-accent" aria-hidden />
          <p className="text-muted">If <b className="text-ink">{email}</b> is an admin account, a reset link is on its way. It works once and expires in 1 hour.</p>
        </div>
        <Button to="/login" className="mt-6 w-full">Back to sign in</Button>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Reset password" sub="We will email you a link to choose a new password.">
      <form onSubmit={submit} className="space-y-5">
        <Field label="Email" htmlFor="email">
          <Input id="email" type="email" autoComplete="username" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        <Button type="submit" variant="primary" className="h-12 w-full" loading={busy} disabled={!email}>Send reset link</Button>
        <p className="text-center text-sm">
          <Link to="/login" className="text-muted underline-offset-4 hover:text-ink hover:underline">Back to sign in</Link>
        </p>
      </form>
    </AuthShell>
  )
}
