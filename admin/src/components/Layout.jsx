import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Activity, ClipboardList, FileText, Inbox, LayoutDashboard, LogOut, Mail, Menu, Moon, Sun, UserCircle, Users, X,
} from 'lucide-react'
import { useAuth, useCounts, useTheme } from '../lib/contexts'
import { cx } from '../lib/cx'
import { CountPill, IconButton, Star } from './ui'
import ErrorBoundary from './ErrorBoundary'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/surveys', label: 'Surveys', icon: ClipboardList, count: 'surveys_new' },
  { to: '/enquiries', label: 'Enquiries', icon: Inbox, count: 'enquiries_new' },
  { to: '/email', label: 'Email', icon: Mail },
  { to: '/content', label: 'Site content', icon: FileText },
  { to: '/admins', label: 'Admins', icon: Users },
  { to: '/activity', label: 'Activity', icon: Activity },
]

function Brand() {
  return (
    <NavLink to="/" className="flex items-center gap-2.5" aria-label="BLOXio admin home">
      <img src="/bloxio-logo.png" alt="BLOXio" className="h-5 w-auto" />
      <span className="text-label rounded-md border border-line px-1.5 py-0.5 text-muted">Admin</span>
    </NavLink>
  )
}

function NavItems({ onNavigate }) {
  const { counts } = useCounts()
  return (
    <nav className="flex flex-col gap-0.5" aria-label="Main">
      {NAV.map(({ to, label, icon: Icon, end, count }) => (
        <NavLink key={to} to={to} end={end} onClick={onNavigate}
          className={({ isActive }) => cx(
            'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition',
            isActive ? 'bg-accent/12 text-ink' : 'text-muted hover:bg-sunken hover:text-ink',
          )}>
          {({ isActive }) => (
            <>
              <Icon className={cx('h-4 w-4 shrink-0', isActive && 'text-accent')} aria-hidden />
              <span>{label}</span>
              {count && <CountPill n={counts?.[count]} />}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

function AccountBlock({ onNavigate }) {
  const { admin, logout } = useAuth()
  const { theme, toggle } = useTheme()
  return (
    <div className="border-t border-line pt-3">
      <NavLink to="/account" onClick={onNavigate}
        className={({ isActive }) => cx('flex items-center gap-3 rounded-xl px-3 py-2 transition', isActive ? 'bg-accent/12' : 'hover:bg-sunken')}>
        <UserCircle className="h-5 w-5 shrink-0 text-muted" aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 truncate text-sm font-bold">
            {admin?.name || admin?.email}
            {admin?.is_super && <Star className="h-3 w-3" alt="Super admin" />}
          </span>
          <span className="block truncate text-xs text-muted">{admin?.email}</span>
        </span>
      </NavLink>
      <div className="mt-1 flex items-center gap-1 px-1">
        <button type="button" onClick={toggle}
          className="flex flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-bold text-muted transition hover:bg-sunken hover:text-ink">
          {theme === 'dark' ? <Sun className="h-3.5 w-3.5" aria-hidden /> : <Moon className="h-3.5 w-3.5" aria-hidden />}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
        <button type="button" onClick={logout}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-bold text-muted transition hover:bg-sunken hover:text-danger">
          <LogOut className="h-3.5 w-3.5" aria-hidden /> Sign out
        </button>
      </div>
    </div>
  )
}

export default function Layout() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const { refresh } = useCounts()

  // keep badges fresh as people move around
  useEffect(() => { refresh() }, [pathname, refresh])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open])

  const close = () => setOpen(false)

  return (
    <div className="min-h-dvh lg:flex">
      {/* desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line bg-surface px-3 py-4 lg:flex">
        <div className="px-3 pb-5 pt-1"><Brand /></div>
        <div className="flex-1 overflow-y-auto"><NavItems /></div>
        <AccountBlock />
      </aside>

      {/* phone / tablet top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-surface/95 px-4 backdrop-blur lg:hidden">
        <Brand />
        <IconButton icon={Menu} label="Open menu" onClick={() => setOpen(true)} className="h-10 w-10" />
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />
          <div className="absolute inset-y-0 right-0 flex w-72 max-w-[85vw] flex-col border-l border-line bg-surface px-3 py-4">
            <div className="flex items-center justify-between px-3 pb-5">
              <Brand />
              <IconButton icon={X} label="Close menu" onClick={close} />
            </div>
            <div className="flex-1 overflow-y-auto"><NavItems onNavigate={close} /></div>
            <AccountBlock onNavigate={close} />
          </div>
        </div>
      )}

      <main className="field-glow min-w-0 flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <ErrorBoundary key={pathname}>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  )
}
