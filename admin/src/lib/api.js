/* The backend: VITE_API_URL if set, otherwise the live API on any real
   domain and the local one in development. Never localhost in production. */
const isLocal = typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)
export const API_URL = (import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:8000' : 'https://api.bloxio.tech')).replace(/\/$/, '')

const TOKEN_KEY = 'bx-admin-token'

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
}
export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch { /* storage blocked */ }
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

/** Turn FastAPI's error body (string or validation list) into one readable sentence. */
function errorMessage(body, status) {
  const d = body?.detail
  if (typeof d === 'string') return d
  if (Array.isArray(d) && d.length) {
    return d.map((e) => {
      const field = Array.isArray(e.loc) ? e.loc.filter((x) => x !== 'body').join(' → ') : ''
      return field ? `${field}: ${e.msg}` : e.msg
    }).join('; ')
  }
  if (status === 429) return 'Too many requests. Wait a moment and try again.'
  if (status >= 500) return 'The server had a problem. Try again shortly.'
  return `Request failed (${status}).`
}

export function query(params = {}) {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue
    sp.set(k, String(v))
  }
  const s = sp.toString()
  return s ? `?${s}` : ''
}

/* ── waking the server ─────────────────────────────────────────────
   The API runs on Render's free plan, which sleeps when idle; the first
   request after that waits ~30–60s, and while it starts Render may answer
   with an error page the browser reports as "network error". So:
   - wake() pings /health (safe to repeat) until the server answers;
   - GETs are simply retried while it wakes;
   - anything that changes data (POST/PUT/…) first waits for wake(), then
     is sent exactly once, so nothing is ever submitted twice. */
const WAKE_FOR_MS = 75000
const GATEWAY = new Set([502, 503, 504, 520, 521, 522, 523, 524])
let awakeUntil = 0
let waking = null
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function timed(url, init, ms) {
  return fetch(url, { ...init, signal: AbortSignal.timeout(ms) })
}

export function wake() {
  if (Date.now() < awakeUntil) return Promise.resolve(true)
  if (waking) return waking
  waking = (async () => {
    const until = Date.now() + WAKE_FOR_MS
    let delay = 1500
    while (Date.now() < until) {
      try {
        const r = await timed(`${API_URL}/health`, {}, 20000)
        if (r.ok) { awakeUntil = Date.now() + 60000; return true }
      } catch { /* still waking */ }
      window.dispatchEvent(new Event('bx:waking'))
      await sleep(delay)
      delay = Math.min(delay * 1.6, 8000)
    }
    return false
  })().finally(() => { waking = null })
  return waking
}

async function raw(path, { method = 'GET', body, params, auth = true } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (auth && token) headers.Authorization = `Bearer ${token}`
  const url = `${API_URL}${path}${query(params)}`
  const init = { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined }
  const safe = method === 'GET' || method === 'HEAD'

  if (!safe && !(await wake())) {
    throw new ApiError('The server is taking too long to respond. Try again in a minute.', 0)
  }
  let res
  for (let attempt = 0; ; attempt++) {
    try {
      res = await timed(url, init, 30000)
      if (safe && GATEWAY.has(res.status) && attempt < 3) { awakeUntil = 0; await wake(); continue }
      break
    } catch {
      if (safe && attempt < 3) { awakeUntil = 0; await wake(); continue }
      throw new ApiError(safe
        ? 'Could not reach the server. Check your connection and try again.'
        : 'The connection dropped before the server answered. Check your connection, then try again.', 0)
    }
  }
  if (res.ok) awakeUntil = Date.now() + 60000
  if (res.status === 401 && auth && token) {
    setToken(null)
    window.dispatchEvent(new Event('bx:unauthorized'))
  }
  if (!res.ok) {
    let data = null
    try { data = await res.json() } catch { /* not json */ }
    throw new ApiError(errorMessage(data, res.status), res.status)
  }
  return res
}

export async function api(path, opts) {
  const res = await raw(path, opts)
  if (res.status === 204) return null
  return res.json()
}

/** Fetch a file with the auth header and hand it to the browser as a download. */
export async function download(path, params, fallbackName = 'download') {
  const res = await raw(path, { params })
  const cd = res.headers.get('Content-Disposition') || ''
  const name = /filename="?([^";]+)"?/i.exec(cd)?.[1] || fallbackName
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
