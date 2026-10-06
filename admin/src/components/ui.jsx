import { useEffect, useId, useRef } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react'
import { cx } from '../lib/cx'

/* ── brand ─────────────────────────────────────────────────────────── */
export function Star({ className = 'h-4 w-4', alt = '' }) {
  return <img src="/brand/star.png" alt={alt} aria-hidden={alt ? undefined : true} className={cx('select-none object-contain', className)} draggable="false" />
}

/* ── buttons ───────────────────────────────────────────────────────── */
const BTN = {
  primary: 'bg-accent text-on-accent hover:brightness-110 border border-transparent',
  secondary: 'bg-surface text-ink border border-line hover:border-accent/60',
  ghost: 'text-muted hover:text-ink hover:bg-sunken border border-transparent',
  danger: 'bg-transparent text-danger border border-danger/40 hover:bg-danger/10',
}
const SIZE = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
}

export function Button({ variant = 'secondary', size = 'md', loading, icon: Icon, children, className, as, to, ...rest }) {
  const cls = cx(
    'inline-flex items-center justify-center rounded-xl font-bold whitespace-nowrap transition disabled:opacity-50 disabled:pointer-events-none',
    BTN[variant], SIZE[size], className,
  )
  const inner = (
    <>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden /> : null}
      {children}
    </>
  )
  if (to || as === 'link') return <Link to={to} className={cls} {...rest}>{inner}</Link>
  return <button type="button" className={cls} disabled={loading || rest.disabled} {...rest}>{inner}</button>
}

export function IconButton({ icon: Icon, label, className, ...rest }) {
  return (
    <button type="button" aria-label={label} title={label}
      className={cx('inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-sunken hover:text-ink disabled:opacity-40 disabled:pointer-events-none', className)}
      {...rest}>
      <Icon className="h-4 w-4" aria-hidden />
    </button>
  )
}

/* ── surfaces ──────────────────────────────────────────────────────── */
export function Card({ className, children, ...rest }) {
  return <div className={cx('rounded-2xl border border-line bg-surface', className)} {...rest}>{children}</div>
}

export function CardHeader({ title, action, sub }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
      <div className="min-w-0">
        <h2 className="text-label text-muted">{title}</h2>
        {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
      </div>
      {action}
    </div>
  )
}

export function PageHeader({ title, sub, actions, back }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {back && (
          <Link to={back.to} className="mb-2 inline-flex items-center gap-1 text-xs font-bold text-muted hover:text-ink">
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden /> {back.label}
          </Link>
        )}
        <h1 className="font-display text-2xl leading-none sm:text-3xl">{title}</h1>
        {sub && <p className="mt-2 text-sm text-muted">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

/* ── badges ────────────────────────────────────────────────────────── */
const TONES = {
  neutral: 'border-line text-muted',
  accent: 'border-accent/40 text-accent bg-accent/10',
  warn: 'border-warn/40 text-warn bg-warn/10',
  danger: 'border-danger/40 text-danger bg-danger/10',
  gold: 'border-gold/50 text-gold bg-gold/10',
}
export function Badge({ tone = 'neutral', children, className }) {
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[11px] font-medium leading-4 tracking-wide whitespace-nowrap', TONES[tone], className)}>
      {children}
    </span>
  )
}

const STATUS_TONE = {
  new: 'accent', reviewed: 'neutral', contacted: 'gold', archived: 'neutral',
  replied: 'gold', closed: 'neutral',
  sent: 'accent', logged: 'warn', failed: 'danger',
}
export function StatusBadge({ status }) {
  return <Badge tone={STATUS_TONE[status] || 'neutral'}>{status}</Badge>
}

export function CountPill({ n, className }) {
  if (!n) return null
  return (
    <span className={cx('ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 font-mono text-[11px] font-medium leading-5 text-on-accent', className)}>
      {n > 99 ? '99+' : n}
    </span>
  )
}

/* ── form ──────────────────────────────────────────────────────────── */
export function Field({ label, hint, error, children, className, htmlFor }) {
  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      {label && <label htmlFor={htmlFor} className="text-label text-muted">{label}</label>}
      {children}
      {error ? <p className="text-xs text-danger">{error}</p> : hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  )
}

export function Input({ className, ...rest }) {
  return <input className={cx('field', className)} {...rest} />
}
export function Textarea({ className, ...rest }) {
  return <textarea className={cx('field min-h-24 resize-y', className)} {...rest} />
}
export function Select({ className, children, ...rest }) {
  return <select className={cx('field', className)} {...rest}>{children}</select>
}

export function Toggle({ checked, onChange, label, id }) {
  const auto = useId()
  const tid = id || auto
  return (
    <label htmlFor={tid} className="inline-flex cursor-pointer items-center gap-2.5 text-sm">
      <button id={tid} type="button" role="switch" aria-checked={!!checked} onClick={() => onChange(!checked)}
        className={cx('relative h-6 w-10 shrink-0 rounded-full border transition',
          checked ? 'border-accent bg-accent' : 'border-line bg-sunken')}>
        <span className={cx('absolute top-0.5 h-4.5 w-4.5 rounded-full transition-all',
          checked ? 'left-[1.15rem] bg-on-accent' : 'left-0.5 bg-muted')} />
      </button>
      {label && <span>{label}</span>}
    </label>
  )
}

/* ── loading, empty, error ─────────────────────────────────────────── */
export function Skeleton({ className }) {
  return <div className={cx('skeleton', className)} aria-hidden />
}

export function SkeletonRows({ rows = 6 }) {
  return (
    <div className="space-y-3 p-4 sm:p-5" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="hidden h-4 w-20 sm:block" />
        </div>
      ))}
    </div>
  )
}

export function Empty({ icon: Icon, title, children, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      {Icon ? <Icon className="h-8 w-8 text-muted/70" aria-hidden /> : <Star className="h-7 w-7 opacity-80" />}
      <p className="mt-1 font-bold">{title}</p>
      {children && <p className="max-w-sm text-sm text-muted">{children}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export function ErrorNote({ error, onRetry }) {
  if (!error) return null
  return (
    <div role="alert" className="flex items-start gap-3 rounded-2xl border border-danger/40 bg-danger/10 p-4 text-sm">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden />
      <div className="flex-1">
        <p className="font-bold text-danger">Something went wrong</p>
        <p className="mt-0.5 text-ink/90">{error.message || String(error)}</p>
      </div>
      {onRetry && <Button size="sm" onClick={onRetry}>Retry</Button>}
    </div>
  )
}

/* ── pagination ────────────────────────────────────────────────────── */
export function Pagination({ total, limit, offset, onChange }) {
  if (!total) return null
  const from = offset + 1
  const to = Math.min(offset + limit, total)
  return (
    <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3 text-xs text-muted sm:px-5">
      <span className="font-mono">{from}–{to} of {total}</span>
      <div className="flex items-center gap-1">
        <IconButton icon={ChevronLeft} label="Previous page" disabled={offset === 0} onClick={() => onChange(Math.max(0, offset - limit))} />
        <IconButton icon={ChevronRight} label="Next page" disabled={to >= total} onClick={() => onChange(offset + limit)} />
      </div>
    </div>
  )
}

/* ── dialog ────────────────────────────────────────────────────────── */
export function Modal({ open, onClose, title, children, footer, wide }) {
  const ref = useRef(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])
  return (
    <dialog ref={ref} onClose={onClose} onCancel={(e) => { e.preventDefault(); onClose() }}
      onClick={(e) => { if (e.target === ref.current) onClose() }}
      className={cx('m-auto w-[calc(100%-2rem)] rounded-2xl border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm',
        wide ? 'max-w-2xl' : 'max-w-md')}>
      {open && (
        <div>
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
            <h2 className="font-bold">{title}</h2>
            <IconButton icon={X} label="Close" onClick={onClose} />
          </div>
          <div className="px-5 py-4 text-sm">{children}</div>
          {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-3.5">{footer}</div>}
        </div>
      )}
    </dialog>
  )
}

export function ConfirmDialog({ open, title, children, confirmLabel = 'Confirm', danger, loading, onConfirm, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title={title}
      footer={(
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant={danger ? 'danger' : 'primary'} loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
        </>
      )}>
      {children}
    </Modal>
  )
}

/* ── misc ──────────────────────────────────────────────────────────── */
export function Stat({ label, value, sub, to }) {
  const body = (
    <>
      <p className="text-label text-muted">{label}</p>
      <p className="mt-2 font-display text-3xl leading-none">{value ?? '—'}</p>
      {sub && <p className="mt-2 text-xs text-muted">{sub}</p>}
    </>
  )
  const cls = 'block rounded-2xl border border-line bg-surface p-4 sm:p-5'
  return to ? <Link to={to} className={cx(cls, 'transition hover:border-accent/60')}>{body}</Link> : <div className={cls}>{body}</div>
}

export function Chips({ items }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((v, i) => (
        <span key={i} className="rounded-lg border border-line bg-sunken px-2 py-0.5 text-xs">{String(v)}</span>
      ))}
    </div>
  )
}
