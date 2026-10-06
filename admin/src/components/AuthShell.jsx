import { useTheme } from '../lib/contexts'
import { Moon, Sun } from 'lucide-react'
import { Star } from './ui'

/** Centred card used by login, forgot and reset pages. */
export default function AuthShell({ title, sub, children }) {
  const { theme, toggle } = useTheme()
  return (
    <div className="field-glow relative flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <button type="button" onClick={toggle} aria-label="Toggle light and dark mode"
        className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted hover:bg-sunken hover:text-ink">
        {theme === 'dark' ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
      </button>
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <img src="/bloxio-logo.png" alt="BLOXio" className="h-7 w-auto" />
          <span className="text-label text-muted">Admin portal</span>
        </div>
        <div className="relative rounded-2xl border border-line bg-surface p-6 shadow-2xl shadow-black/20 sm:p-7">
          <Star className="absolute -right-3 -top-3 h-7 w-7" />
          <h1 className="font-display text-xl leading-tight">{title}</h1>
          {sub && <p className="mt-2 text-sm text-muted">{sub}</p>}
          <div className="mt-6">{children}</div>
        </div>
        <p className="mt-6 text-center text-xs text-muted">BLOXio Nigeria Limited · staff only</p>
      </div>
    </div>
  )
}
