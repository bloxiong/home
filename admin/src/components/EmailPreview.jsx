import { useRef, useState } from 'react'

/**
 * Renders a logged email body (HTML) in a sandboxed iframe: no scripts, no forms,
 * links open in a new tab. allow-same-origin only lets us measure its height.
 */
export default function EmailPreview({ html, className = '' }) {
  const ref = useRef(null)
  const [height, setHeight] = useState(120)
  const doc = `<!doctype html><html><head><meta charset="utf-8"><base target="_blank">
<style>html,body{margin:0}body{padding:16px 18px;background:#131615;color:#EEF1EF;font:14px/1.6 Arial,Helvetica,sans-serif;word-wrap:break-word}a{color:#6FD39D}table{max-width:100%}</style>
</head><body>${html || '<p style="color:#9BA39E">(empty)</p>'}</body></html>`
  return (
    <iframe
      ref={ref}
      title="Email preview"
      sandbox="allow-same-origin allow-popups"
      srcDoc={doc}
      onLoad={() => {
        try {
          const h = ref.current?.contentDocument?.documentElement?.scrollHeight
          if (h) setHeight(Math.min(h + 2, 640))
        } catch { /* cross-origin: keep default height */ }
      }}
      style={{ height }}
      className={`block w-full rounded-xl border border-line bg-[#131615] ${className}`}
    />
  )
}
