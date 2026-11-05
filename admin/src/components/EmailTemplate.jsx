import { useRef, useState } from 'react'
import { Code2, Copy, Download } from 'lucide-react'
import { Button, Card, CardHeader, ErrorNote, Skeleton, Toggle } from './ui'
import { useToast } from '../lib/contexts'
import { useApi, useDebounced } from '../lib/hooks'

/* Puts `html` on the clipboard as formatted HTML (so it pastes into Gmail or
   Outlook as the designed email) and as plain text. The copy-event route runs
   first: it is synchronous inside the click and needs no permission prompt.
   The async Clipboard API is the fallback. */
async function copyHtml(html, plain) {
  let fired = false
  const onCopy = (e) => {
    fired = true
    e.clipboardData.setData('text/html', html)
    e.clipboardData.setData('text/plain', plain)
    e.preventDefault()
  }
  document.addEventListener('copy', onCopy, true)
  const ta = document.createElement('textarea')
  ta.value = ' '
  ta.style.cssText = 'position:fixed;opacity:0;left:-9999px;top:0'
  document.body.appendChild(ta)
  ta.select()
  let ok = false
  try { ok = document.execCommand('copy') } catch { ok = false }
  ta.remove()
  document.removeEventListener('copy', onCopy, true)
  if (ok && fired) return
  await navigator.clipboard.write([new window.ClipboardItem({
    'text/html': new Blob([html], { type: 'text/html' }),
    'text/plain': new Blob([plain], { type: 'text/plain' }),
  })])
}

// the email itself, without <html>/<head>, which mail apps drop on paste anyway
const bodyOf = (doc) => new DOMParser().parseFromString(doc, 'text/html').body.innerHTML.trim()

export default function EmailTemplate() {
  const toast = useToast()
  const [theme, setTheme] = useState('light')
  const [button, setButton] = useState(false)
  const params = useDebounced({ theme, button }, 150)
  const { data, error, reload } = useApi('/admin/email/template', params)
  const html = data?.html || ''
  const frame = useRef(null)
  const [height, setHeight] = useState(560)

  async function copyDesign() {
    try {
      await copyHtml(bodyOf(html), bodyOf(html))
      toast.success('Template copied. Paste it into a new Gmail or Outlook message.')
    } catch {
      toast.error('Your browser blocked the copy. Click the page once and try again.')
    }
  }
  async function copyCode() {
    try {
      await navigator.clipboard.writeText(html)
      toast.success('HTML code copied.')
    } catch {
      toast.error('Your browser blocked the copy. Click the page once and try again.')
    }
  }
  function download() {
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
    const a = Object.assign(document.createElement('a'), { href: url, download: `bloxio-email-${theme}.html` })
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="mt-4">
      <CardHeader title="Email template" sub="The official BLOXio email design. Copy it into your own mail app and write over the placeholder text." />
      <div className="grid grid-cols-1 gap-6 p-5 sm:p-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="space-y-4">
          <div>
            <p className="text-label mb-1.5 text-muted">Version</p>
            <div className="inline-flex rounded-xl border border-line p-1" role="radiogroup" aria-label="Template version">
              {['light', 'dark'].map((t) => (
                <button key={t} type="button" role="radio" aria-checked={theme === t} onClick={() => setTheme(t)}
                  className={`rounded-lg px-4 py-1.5 text-sm font-semibold capitalize transition ${theme === t ? 'bg-accent text-on-accent' : 'text-muted hover:text-ink'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <Toggle checked={button} onChange={setButton} label="Include a button" />

          <div className="flex flex-col gap-2 pt-1">
            <Button variant="primary" icon={Copy} disabled={!html} onClick={copyDesign} className="whitespace-normal!">Copy for Gmail / Outlook</Button>
            <Button variant="secondary" icon={Code2} disabled={!html} onClick={copyCode}>Copy HTML code</Button>
            <Button variant="ghost" icon={Download} disabled={!html} onClick={download}>Download .html</Button>
          </div>
        </div>

        <div className="min-w-0">
          <ErrorNote error={error} onRetry={reload} />
          {!html && !error ? <Skeleton className="h-[560px] rounded-xl" /> : html && (
            <iframe
              ref={frame}
              title="Email template preview"
              sandbox="allow-same-origin"
              srcDoc={html}
              onLoad={() => {
                try {
                  const h = frame.current?.contentDocument?.documentElement?.scrollHeight
                  if (h) setHeight(Math.min(h + 2, 900))
                } catch { /* keep default height */ }
              }}
              style={{ height }}
              className="block w-full rounded-xl border border-line bg-white"
            />
          )}
        </div>
      </div>
    </Card>
  )
}
