import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../lib/contexts'

/** Centred card used by login, forgot and reset pages. */
export default function AuthShell({ title, sub, children }) {
  const { theme, toggle } = useTheme()
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-12">
      <div className="bx-sky" aria-hidden />
      {/* a soft gold-green aurora behind the card */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-[18%] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(229,192,138,0.18),rgba(95,203,147,0.08)_45%,transparent_70%)] blur-2xl" />
      <button type="button" onClick={toggle} aria-label="Toggle light and dark mode"
        className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-xl text-muted transition hover:bg-ink/5 hover:text-ink">
        {theme === 'dark' ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
      </button>

      <div className="page-in relative w-full max-w-[26rem]">
        <div className="mb-9 flex flex-col items-center text-center">
          <img src="/bloxio-logo.png" alt="BLOXio" className="h-10 w-auto drop-shadow-[0_6px_24px_rgba(229,192,138,0.25)] sm:h-12" />
        </div>
        <div className="bx-card relative p-7 sm:p-9">
          <p className="text-label mb-3 text-muted">Admin portal</p>
          <h1 className="font-display text-2xl leading-tight">{title}</h1>
          {sub && <p className="mt-2.5 text-[15px] leading-relaxed text-muted">{sub}</p>}
          <div className="mt-7">{children}</div>
        </div>
        <p className="mt-8 text-center text-xs text-muted">BLOXio Nigeria Limited · staff only</p>
      </div>
    </div>
  )
}
