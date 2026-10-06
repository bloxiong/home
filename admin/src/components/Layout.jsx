import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Activity, ChevronsLeft, ChevronsRight, ClipboardList, FileText, Globe2, Inbox, LayoutDashboard, LogOut, Mail,
  MoreHorizontal, Moon, Sun, Users, X,
} from 'lucide-react'
import { useAuth, useCounts, useTheme } from '../lib/contexts'
import { cx } from '../lib/cx'
import { IconButton, Star } from './ui'
import ErrorBoundary from './ErrorBoundary'

const GROUPS = [
  { title: 'Overview', items: [
    { to: '/', label: 'Dashboard', short: 'Home', icon: LayoutDashboard, end: true },
    { to: '/traffic', label: 'Traffic', icon: Globe2 },
  ] },
  { title: 'Inbox', items: [
    { to: '/surveys', label: 'Surveys', icon: ClipboardList, count: 'surveys_new' },
    { to: '/enquiries', label: 'Enquiries', icon: Inbox, count: 'enquiries_new' },
    { to: '/email', label: 'Email', icon: Mail },
  ] },
  { title: 'Site', items: [
    { to: '/content', label: 'Site content', icon: FileText },
  ] },
  { title: 'Team', items: [
    { to: '/admins', label: 'Admins', icon: Users },
    { to: '/activity', label: 'Activity', icon: Activity },
  ] },
]
const ALL = GROUPS.flatMap((g) => g.items)
const TABS = ['/', '/traffic', '/surveys', '/enquiries'].map((to) => ALL.find((i) => i.to === to))

const initials = (a) => (a?.name || a?.email || '?').split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()

function Brand({ compact }) {
  return (
    <NavLink to="/" className="group flex items-center gap-3" aria-label="BLOXio admin home">
      {compact
        ? <img src="/brand/star.png" alt="BLOXio" className="star-glow h-8 w-8 transition group-hover:rotate-12" />
        : (
          <>
            <img src="/bloxio-logo.png" alt="BLOXio" className="h-6 w-auto" />
            <span className="text-label rounded-full border border-gold/40 px-2 py-0.5 text-gold-ink">admin</span>
          </>
        )}
    </NavLink>
  )
}

function NavItem({ item, rail, onNavigate }) {
  const { counts } = useCounts()
  const { to, label, icon: Icon, end, count } = item
  const n = count ? counts?.[count] : 0
  return (
    <NavLink to={to} end={end} onClick={onNavigate} title={rail ? label : undefined}
      className={({ isActive }) => cx(
        'group relative flex h-11 items-center rounded-xl text-[15px] font-medium transition-all duration-200',
        rail ? 'w-11 justify-center' : 'gap-3.5 px-3.5',
        isActive ? 'nav-active text-ink' : 'text-muted hover:bg-ink/5 hover:text-ink',
      )}>
      {({ isActive }) => (
        <>
          <Icon className={cx('h-[18px] w-[18px] shrink-0 transition', isActive ? 'text-accent' : 'group-hover:scale-105')} aria-hidden />
          {!rail && <span className="truncate">{label}</span>}
          {!rail && (n > 0 ? (
            <span className="ml-auto inline-flex min-w-6 items-center justify-center rounded-full bg-accent px-1.5 font-mono text-[11px] font-medium leading-5 text-on-accent">{n > 99 ? '99+' : n}</span>
          ) : isActive && <Star className="star-glow ml-auto h-3.5 w-3.5" />)}
          {rail && n > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent ring-2 ring-surface" aria-label={`${n} new`} />}
        </>
      )}
    </NavLink>
  )
}

function NavGroups({ rail, onNavigate }) {
  return (
    <nav aria-label="Main" className={cx('flex flex-col', rail ? 'items-center gap-5' : 'gap-6')}>
      {GROUPS.map((g) => (
        <div key={g.title} className={cx('flex flex-col gap-1', rail && 'items-center')}>
          {rail ? <span className="mb-1 h-px w-6 bg-line" aria-hidden /> : <p className="text-label mb-1.5 px-3.5 text-muted/70">{g.title}</p>}
          {g.items.map((i) => <NavItem key={i.to} item={i} rail={rail} onNavigate={onNavigate} />)}
        </div>
      ))}
    </nav>
  )
}

function UserCard({ rail, onNavigate }) {
  const { admin, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const ThemeIcon = theme === 'dark' ? Sun : Moon
  const avatar = (
    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent/30 to-accent/5 font-mono text-xs font-medium text-ink ring-1 ring-accent/30">
      {initials(admin)}
      {admin?.is_super && <Star className="star-glow absolute -right-1 -top-1 h-3.5 w-3.5" alt="Super admin" />}
    </span>
  )
  if (rail) {
    return (
      <div className="flex flex-col items-center gap-2 border-t border-line pt-4">
        <NavLink to="/account" onClick={onNavigate} title="Your account" className="rounded-full transition hover:scale-105">{avatar}</NavLink>
        <IconButton icon={ThemeIcon} label={theme === 'dark' ? 'Light mode' : 'Dark mode'} onClick={toggle} />
        <IconButton icon={LogOut} label="Sign out" onClick={logout} className="hover:text-danger" />
      </div>
    )
  }
  return (
    <div className="rounded-2xl border border-line bg-field/60 p-2">
      <NavLink to="/account" onClick={onNavigate}
        className={({ isActive }) => cx('flex items-center gap-3 rounded-xl p-2 transition', isActive ? 'nav-active' : 'hover:bg-ink/5')}>
        {avatar}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold">{admin?.name || admin?.email}</span>
          <span className="block truncate text-xs text-muted">{admin?.is_super ? 'Super admin' : 'Admin'} · {admin?.email}</span>
        </span>
      </NavLink>
      <div className="mt-1 grid grid-cols-2 gap-1">
        <button type="button" onClick={toggle}
          className="flex h-9 items-center justify-center gap-2 rounded-xl text-xs font-bold text-muted transition hover:bg-ink/5 hover:text-ink">
          <ThemeIcon className="h-3.5 w-3.5" aria-hidden /> {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
        <button type="button" onClick={logout}
          className="flex h-9 items-center justify-center gap-2 rounded-xl text-xs font-bold text-muted transition hover:bg-danger/10 hover:text-danger">
          <LogOut className="h-3.5 w-3.5" aria-hidden /> Sign out
        </button>
      </div>
    </div>
  )
}

function readRail() {
  try { return localStorage.getItem('bx-admin-rail') === '1' } catch { return false }
}

export default function Layout() {
  const [more, setMore] = useState(false)
  const [collapsed, setCollapsed] = useState(readRail)
  const { pathname } = useLocation()
  const { counts, refresh } = useCounts()
  const { theme, toggle } = useTheme()

  // keep badges fresh as people move around
  useEffect(() => { refresh() }, [pathname, refresh])

  useEffect(() => {
    try { localStorage.setItem('bx-admin-rail', collapsed ? '1' : '0') } catch { /* ignore */ }
  }, [collapsed])

  useEffect(() => {
    if (!more) return
    const onKey = (e) => { if (e.key === 'Escape') setMore(false) }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [more])

  const close = () => setMore(false)
  const tabActive = (to) => (to === '/' ? pathname === '/' : pathname.startsWith(to))
  const moreActive = !TABS.some((t) => tabActive(t.to))

  return (
    <div className="relative min-h-dvh md:flex">
      <div className="bx-sky" aria-hidden />

      {/* sidebar: icon rail on tablets, full on desktop (collapsible) */}
      <aside className={cx(
        'sticky top-0 z-20 hidden h-dvh shrink-0 flex-col border-r border-line bg-surface/85 backdrop-blur-xl transition-[width] duration-300 md:flex',
        collapsed ? 'w-20' : 'w-20 lg:w-72',
      )}>
        {/* tablets: always rail */}
        <div className={cx('flex h-full flex-col items-center px-3 py-6', !collapsed && 'lg:hidden')}>
          <div className="mb-8"><Brand compact /></div>
          <div className="no-scrollbar flex-1 overflow-y-auto"><NavGroups rail /></div>
          <UserCard rail />
          <button type="button" onClick={() => setCollapsed(false)} aria-label="Expand sidebar" title="Expand sidebar"
            className="mt-3 hidden h-9 w-9 items-center justify-center rounded-xl text-muted hover:bg-ink/5 hover:text-ink lg:inline-flex">
            <ChevronsRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
        {/* desktop: full */}
        {!collapsed && (
          <div className="hidden h-full flex-col px-5 py-7 lg:flex">
            <div className="mb-10 flex items-center justify-between pl-2">
              <Brand />
              <IconButton icon={ChevronsLeft} label="Collapse sidebar" onClick={() => setCollapsed(true)} className="h-8 w-8" />
            </div>
            <div className="no-scrollbar -mx-1 flex-1 overflow-y-auto px-1"><NavGroups /></div>
            <UserCard />
          </div>
        )}
      </aside>

      {/* phones: slim top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-surface/85 px-4 backdrop-blur-xl md:hidden">
        <Brand />
        <IconButton icon={theme === 'dark' ? Sun : Moon} label={theme === 'dark' ? 'Light mode' : 'Dark mode'} onClick={toggle} />
      </header>

      <main className="relative z-10 min-w-0 flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 pb-32 pt-7 sm:px-8 sm:pt-10 md:pb-16 lg:px-12 lg:pt-12">
          <ErrorBoundary key={pathname}>
            <div className="page-in"><Outlet /></div>
          </ErrorBoundary>
        </div>
      </main>

      {/* phones: bottom tab bar */}
      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        <div className="grid grid-cols-5">
          {TABS.map((t) => {
            const n = t.count ? counts?.[t.count] : 0
            const on = tabActive(t.to)
            return (
              <NavLink key={t.to} to={t.to} end={t.end}
                className={cx('relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-bold transition', on ? 'text-accent' : 'text-muted')}>
                {on && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-accent shadow-[0_0_12px_var(--bx-accent)]" aria-hidden />}
                <span className={cx('relative flex h-8 w-12 items-center justify-center rounded-full transition', on && 'bg-accent/12')}>
                  <t.icon className="h-5 w-5" aria-hidden />
                  {n > 0 && <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-accent px-1 text-center font-mono text-[10px] leading-4 text-on-accent">{n > 9 ? '9+' : n}</span>}
                </span>
                {t.short || t.label}
              </NavLink>
            )
          })}
          <button type="button" onClick={() => setMore(true)} aria-haspopup="dialog"
            className={cx('relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-bold transition', moreActive ? 'text-accent' : 'text-muted')}>
            {moreActive && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-accent shadow-[0_0_12px_var(--bx-accent)]" aria-hidden />}
            <span className={cx('flex h-8 w-12 items-center justify-center rounded-full', moreActive && 'bg-accent/12')}>
              <MoreHorizontal className="h-5 w-5" aria-hidden />
            </span>
            More
          </button>
        </div>
      </nav>

      {/* phones: full-screen "More" sheet */}
      {more && (
        <div className="sheet-in fixed inset-0 z-50 flex flex-col bg-canvas md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="bx-sky" aria-hidden />
          <div className="relative flex h-16 items-center justify-between px-5">
            <Brand />
            <IconButton icon={X} label="Close menu" onClick={close} />
          </div>
          <div className="relative flex-1 overflow-y-auto px-5 pb-6 pt-2">
            <p className="script-label mb-6">where to next</p>
            <NavGroups onNavigate={close} />
          </div>
          <div className="relative border-t border-line px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-4">
            <UserCard onNavigate={close} />
          </div>
        </div>
      )}
    </div>
  )
}
