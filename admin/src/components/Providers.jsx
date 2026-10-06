import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { api, getToken, setToken } from '../lib/api'
import { AuthContext, CountsContext, ThemeContext, ToastContext, useAuth } from '../lib/contexts'
import { cx } from '../lib/cx'

/* ── theme ─────────────────────────────────────────────────────────── */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => (document.documentElement.classList.contains('dark') ? 'dark' : 'light'))
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0B0D0C' : '#D2D7CA')
    try { localStorage.setItem('bx-admin-theme', theme) } catch { /* ignore */ }
  }, [theme])
  const value = useMemo(() => ({ theme, toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) }), [theme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/* ── auth ──────────────────────────────────────────────────────────── */
export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [ready, setReady] = useState(() => !getToken())

  useEffect(() => {
    if (!getToken()) return
    api('/auth/me')
      .then(setAdmin)
      .catch(() => setToken(null))
      .finally(() => setReady(true))
  }, [])

  useEffect(() => {
    const onUnauthorized = () => setAdmin(null)
    window.addEventListener('bx:unauthorized', onUnauthorized)
    return () => window.removeEventListener('bx:unauthorized', onUnauthorized)
  }, [])

  const value = useMemo(() => ({
    admin,
    ready,
    /** Store a session returned by /auth/login, /auth/reset or /auth/change-password */
    setSession({ token, admin: a }) {
      setToken(token)
      setAdmin(a)
    },
    async login(email, password) {
      const res = await api('/auth/login', { method: 'POST', body: { email, password }, auth: false })
      setToken(res.token)
      setAdmin(res.admin)
      return res.admin
    },
    logout() {
      setToken(null)
      setAdmin(null)
    },
  }), [admin, ready])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/* ── counts for the sidebar badges ─────────────────────────────────── */
export function CountsProvider({ children }) {
  const { admin } = useAuth()
  const [counts, setCounts] = useState(null)
  const refresh = useCallback(() => {
    api('/admin/stats')
      .then((s) => setCounts({ surveys_new: s.surveys_new, enquiries_new: s.enquiries_new, stats: s }))
      .catch(() => { /* badges are best effort */ })
  }, [])
  useEffect(() => {
    if (!admin) return
    refresh()
    const t = setInterval(refresh, 60_000)
    return () => clearInterval(t)
  }, [admin, refresh])
  const value = useMemo(() => ({ counts: admin ? counts : null, refresh }), [admin, counts, refresh])
  return <CountsContext.Provider value={value}>{children}</CountsContext.Provider>
}

/* ── toasts ────────────────────────────────────────────────────────── */
const ICONS = { success: CheckCircle2, error: XCircle, info: Info }

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const id = useRef(0)
  const dismiss = useCallback((tid) => setToasts((ts) => ts.filter((t) => t.id !== tid)), [])
  const push = useCallback((kind, message) => {
    const tid = ++id.current
    setToasts((ts) => [...ts.slice(-3), { id: tid, kind, message }])
    setTimeout(() => dismiss(tid), kind === 'error' ? 7000 : 4000)
  }, [dismiss])
  const value = useMemo(() => ({
    success: (m) => push('success', m),
    error: (m) => push('error', m?.message || String(m)),
    info: (m) => push('info', m),
  }), [push])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:items-end">
        {toasts.map((t) => {
          const Icon = ICONS[t.kind]
          return (
            <div key={t.id} role={t.kind === 'error' ? 'alert' : 'status'}
              className="toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-line bg-surface p-3.5 text-sm shadow-xl">
              <Icon className={cx('mt-0.5 h-4 w-4 shrink-0', t.kind === 'error' ? 'text-danger' : t.kind === 'success' ? 'text-accent' : 'text-muted')} aria-hidden />
              <p className="flex-1">{t.message}</p>
              <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-muted hover:text-ink">
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
