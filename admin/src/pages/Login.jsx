import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import { Button, Field, Input } from '../components/ui'
import { useAuth } from '../lib/contexts'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(email.trim(), password)
      nav(loc.state?.from && loc.state.from !== '/login' ? loc.state.from : '/', { replace: true })
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <AuthShell title="Sign in" sub="Use your BLOXio admin email and password.">
      <form onSubmit={submit} className="space-y-5" noValidate>
        <Field label="Email" htmlFor="email">
          <Input id="email" type="email" autoComplete="username" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password" htmlFor="password">
          <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        {error && <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
        <Button type="submit" variant="primary" className="h-12 w-full" loading={busy} disabled={!email || !password}>Sign in</Button>
        <p className="text-center text-sm">
          <Link to="/forgot" state={{ email }} className="text-muted underline-offset-4 hover:text-ink hover:underline">Forgot password?</Link>
        </p>
      </form>
    </AuthShell>
  )
}
