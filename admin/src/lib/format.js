const TZ = 'Africa/Lagos'

const exact = new Intl.DateTimeFormat('en-GB', {
  timeZone: TZ, day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
})
const dayOnly = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, day: 'numeric', month: 'short', year: 'numeric' })

function toDate(v) {
  if (!v) return null
  // API datetimes are UTC; tolerate ones without an offset
  const s = typeof v === 'string' && !/[zZ]|[+-]\d\d:?\d\d$/.test(v) ? `${v}Z` : v
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : d
}

/** "6 Oct 2026, 14:05 WAT" (Lagos time) */
export function fmtDate(v) {
  const d = toDate(v)
  return d ? `${exact.format(d)} WAT` : '—'
}
export function fmtDay(v) {
  const d = toDate(v)
  return d ? dayOnly.format(d) : '—'
}

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
/** "3 minutes ago", "yesterday" … */
export function fmtRelative(v) {
  const d = toDate(v)
  if (!d) return '—'
  const s = Math.round((d.getTime() - Date.now()) / 1000)
  const a = Math.abs(s)
  if (a < 45) return 'just now'
  if (a < 3600) return rtf.format(Math.round(s / 60), 'minute')
  if (a < 86400) return rtf.format(Math.round(s / 3600), 'hour')
  if (a < 86400 * 30) return rtf.format(Math.round(s / 86400), 'day')
  return fmtDay(d)
}

/** camelCase / snake_case / UPPER_CASE → "Camel case" */
export function humanize(key) {
  if (key === undefined || key === null) return ''
  const s = String(key)
    .replace(/^_+/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .trim()
  if (!s) return ''
  const lower = s === s.toUpperCase() ? s.toLowerCase() : s
  const words = lower.split(/\s+/).map((w, i) => (i === 0 ? w : (w === w.toUpperCase() && w.length > 1 ? w : w.toLowerCase())))
  const out = words.join(' ')
  const fixes = { img: 'Image', url: 'URL', href: 'Link', id: 'ID', faqs: 'FAQs', q: 'Question', a: 'Answer', n: 'Number', to: 'Link to' }
  if (fixes[out.toLowerCase()]) return fixes[out.toLowerCase()]
  return out.charAt(0).toUpperCase() + out.slice(1)
}

export const PASSWORD_HINT = 'At least 10 characters, with upper and lower case letters and a number.'
export function passwordProblem(pw) {
  if (!pw) return 'Enter a password.'
  if (pw.length < 10) return 'Use at least 10 characters.'
  if (!/[a-z]/.test(pw) || !/[A-Z]/.test(pw)) return 'Use both upper and lower case letters.'
  if (!/\d/.test(pw)) return 'Include at least one number.'
  return null
}

export function plural(n, word, pluralWord) {
  return `${n} ${n === 1 ? word : pluralWord || `${word}s`}`
}
