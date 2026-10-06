import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import { Button, Field, Input } from '../components/ui'
import { api } from '../lib/api'
import { useAuth, useToast } from '../lib/contexts'
import { PASSWORD_HINT, passwordProblem } from '../lib/format'

/** Used for both first-time invites and password resets (the email links here). */
export default function Reset() {
  const [sp] = useSearchParams()
  const token = sp.get('token') || ''
  const { setSession } = useAuth()
  const toast = useToast()
  const nav = useNavigate()
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [touched, setTouched] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const problem = passwordProblem(pw) || (pw2 && pw !== pw2 ? 'The two passwords do not match.' : null)

  async function submit(e) {
    e.preventDefault()
    setTouched(true)
    if (problem || pw !== pw2) return
    setBusy(true)
    setError('')
    try {
      const res = await api('/auth/reset', { method: 'POST', body: { token, password: pw }, auth: false })
      setSession(res)
      toast.success(`Password set. Welcome, ${res.admin.name || res.admin.email}.`)
      nav('/', { replace: true })
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  if (!token) {
    return (
      <AuthShell title="Link missing" sub="This page needs the link from your invite or reset email.">
        <Button to="/forgot" variant="primary" className="h-12 w-full">Request a new link</Button>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Choose a password" sub="Set the password you will use to sign in to the BLOXio admin.">
      <form onSubmit={submit} className="space-y-5" noValidate>
        <Field label="New password" htmlFor="pw" hint={PASSWORD_HINT} error={touched && passwordProblem(pw)}>
          <Input id="pw" type="password" autoComplete="new-password" autoFocus value={pw} onChange={(e) => setPw(e.target.value)} />
        </Field>
        <Field label="Repeat password" htmlFor="pw2" error={touched && pw2 !== pw ? 'The two passwords do not match.' : null}>
          <Input id="pw2" type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
        </Field>
        {error && (
          <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error} <Link to="/forgot" className="underline">Get a new link</Link>
          </p>
        )}
        <Button type="submit" variant="primary" className="h-12 w-full" loading={busy}>Set password and sign in</Button>
      </form>
    </AuthShell>
  )
}
