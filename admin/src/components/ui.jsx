import { useEffect, useId, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AlertCircle, AlertTriangle, ChevronLeft, ChevronRight, Loader2, Search, X } from 'lucide-react'
import { cx } from '../lib/cx'

/* ── brand ─────────────────────────────────────────────────────────── */
export function Star({ className = 'h-4 w-4', alt = '' }) {
  return <img src="/brand/star.png" alt={alt} aria-hidden={alt ? undefined : true} className={cx('select-none object-contain', className)} draggable="false" />
}

/* ── buttons ───────────────────────────────────────────────────────── */
const BTN = {
  primary: 'bg-accent text-on-accent border border-transparent shadow-[0_10px_26px_-14px_var(--bx-accent)] hover:brightness-110 hover:shadow-[0_14px_30px_-12px_var(--bx-accent)] hover:-translate-y-px motion-reduce:hover:translate-y-0',
  secondary: 'bg-field text-ink border border-line hover:border-accent/50 hover:-translate-y-px motion-reduce:hover:translate-y-0',
  ghost: 'text-muted hover:text-ink hover:bg-ink/5 border border-transparent',
  danger: 'bg-transparent text-danger border border-danger/40 hover:bg-danger/10',
}
const SIZE = {
  sm: 'h-9 px-3.5 text-[13px] gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
}

export function Button({ variant = 'secondary', size = 'md', loading, icon: Icon, children, className, as, to, ...rest }) {
  const cls = cx(
    'inline-flex items-center justify-center rounded-xl font-bold whitespace-nowrap transition-all duration-200 active:translate-y-0 disabled:opacity-45 disabled:shadow-none disabled:pointer-events-none',
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

export function IconButton({ icon: Icon, label, className, compact, ...rest }) {
  return (
    <button type="button" aria-label={label} title={label}
      className={cx('inline-flex items-center', compact ? 'h-8 w-8 sm:h-9 sm:w-9' : 'h-10 w-10', ' justify-center rounded-xl text-muted transition hover:bg-ink/5 hover:text-ink disabled:opacity-40 disabled:pointer-events-none', className)}
      {...rest}>
      <Icon className="h-4 w-4" aria-hidden />
    </button>
  )
}

/* ── surfaces ──────────────────────────────────────────────────────── */
export function Card({ className, children, ...rest }) {
  return <div className={cx('bx-card', className)} {...rest}>{children}</div>
}

export function CardHeader({ title, action, sub }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
      <div className="min-w-0">
        <h2 className="text-label text-muted">{title}</h2>
        {sub && <p className="mt-1 text-xs leading-relaxed text-muted">{sub}</p>}
      </div>
      {action}
    </div>
  )
}

// gold-script eyebrow per section, like the site's "…what we engineer"
const EYEBROWS = {
  '': 'good to see you', traffic: 'who is visiting', surveys: 'what people told us', enquiries: 'people who wrote in',
  email: 'write to people', content: 'what the site says', admins: 'the team', activity: 'who did what', account: 'just you',
}

export function PageHeader({ title, sub, actions, back, eyebrow }) {
  const { pathname } = useLocation()
  const brow = eyebrow ?? EYEBROWS[pathname.split('/')[1] || '']
  return (
    <div className="mb-7 flex flex-col gap-4 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {back && (
          <Link to={back.to} className="group mb-3 inline-flex items-center gap-1 rounded-lg text-xs font-bold text-muted transition hover:text-ink">
            <ChevronLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" aria-hidden /> {back.label}
          </Link>
        )}
        {brow && !back && <p className="script-label mb-2">{brow}</p>}
        <h1 className="font-display text-[1.75rem] leading-[1.05] break-words sm:text-4xl">{title}</h1>
        {sub && <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  )
}

/* ── badges ────────────────────────────────────────────────────────── */
const TONES = {
  neutral: 'border-line text-muted',
  accent: 'border-accent/40 text-accent bg-accent/10',
  warn: 'border-warn/40 text-warn bg-warn/10',
  danger: 'border-danger/40 text-danger bg-danger/10',
  gold: 'border-gold/60 text-gold-ink bg-gold/15',
}
export function Badge({ tone = 'neutral', children, className }) {
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium leading-5 tracking-wide whitespace-nowrap', TONES[tone], className)}>
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
    <div className={cx('flex flex-col gap-2', className)}>
      {label && <label htmlFor={htmlFor} className="text-label text-muted">{label}</label>}
      {children}
      {error ? (
        <p className="flex items-start gap-1.5 text-xs leading-relaxed text-danger"><AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />{error}</p>
      ) : hint ? <p className="text-xs leading-relaxed text-muted">{hint}</p> : null}
    </div>
  )
}

export function Input({ className, ...rest }) {
  return <input className={cx('field', className)} {...rest} />
}
/** Search box with a leading icon and a clear button. */
export function SearchInput({ value, onChange, className, ...rest }) {
  return (
    <div className={cx('relative', className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
      <input type="search" className="field pl-10 pr-10 [&::-webkit-search-cancel-button]:hidden" value={value} onChange={onChange} {...rest} />
      {value && (
        <button type="button" aria-label="Clear search" onClick={() => onChange({ target: { value: '' } })}
          className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:bg-ink/5 hover:text-ink">
          <X className="h-4 w-4" aria-hidden />
        </button>
      )}
    </div>
  )
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
    <label htmlFor={tid} className="inline-flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium">
      <button id={tid} type="button" role="switch" aria-checked={!!checked} onClick={() => onChange(!checked)}
        className={cx('relative h-7 w-12 shrink-0 rounded-full border transition-colors duration-200',
          checked ? 'border-accent bg-accent shadow-[0_6px_18px_-8px_var(--bx-accent)]' : 'border-[var(--bx-field-line)] bg-field')}>
        <span className={cx('absolute top-[3px] h-5 w-5 rounded-full shadow transition-all duration-200',
          checked ? 'left-[1.45rem] bg-on-accent' : 'left-[3px] bg-muted')} />
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
    <div className="space-y-4 p-5 sm:p-6" aria-busy="true" aria-label="Loading">
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
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <div className="relative mb-2">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-field">
          {Icon ? <Icon className="h-6 w-6 text-muted" aria-hidden /> : <Star className="star-glow h-7 w-7" />}
        </span>
        {Icon && <Star className="star-glow absolute -right-2 -top-2 h-5 w-5" />}
      </div>
      <p className="font-bold">{title}</p>
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
    <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3 text-xs text-muted sm:px-6">
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
      className={cx('sheet-in m-auto w-[calc(100%-2rem)] rounded-3xl border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm',
        wide ? 'max-w-2xl' : 'max-w-md')}>
      {open && (
        <div>
          <div className="flex items-center justify-between gap-3 border-b border-line py-3 pl-6 pr-3">
            <h2 className="text-base font-bold">{title}</h2>
            <IconButton icon={X} label="Close" onClick={onClose} />
          </div>
          <div className="px-6 py-5 text-sm leading-relaxed">{children}</div>
          {footer && <div className="flex flex-wrap justify-end gap-2.5 border-t border-line px-6 py-4">{footer}</div>}
        </div>
      )}
    </dialog>
  )
}

export function ConfirmDialog({ open, title, children, confirmLabel = 'Confirm', cancelLabel = 'Cancel', hideCancel, danger, loading, onConfirm, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title={title}
      footer={(
        <>
          {!hideCancel && <Button variant="ghost" onClick={onClose}>{cancelLabel}</Button>}
          <Button variant={danger ? 'danger' : 'primary'} loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
        </>
      )}>
      {children}
    </Modal>
  )
}

/* ── misc ──────────────────────────────────────────────────────────── */
export function Stat({ label, value, sub, to, icon: Icon }) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-label text-muted">{label}</p>
        {Icon && (
          <span className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent/12 text-accent">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-[1.75rem] leading-none sm:text-[2rem]">{value ?? '—'}</p>
      {sub && <p className="mt-2.5 text-xs leading-relaxed text-muted">{sub}</p>}
    </>
  )
  const cls = 'bx-card bx-stat block p-5 sm:p-6'
  return to ? <Link to={to} className={cx(cls, 'lift hover:border-accent/50')}>{body}</Link> : <div className={cls}>{body}</div>
}

export function Chips({ items }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((v, i) => (
        <span key={i} className="rounded-lg border border-line bg-field px-2.5 py-1 text-xs">{String(v)}</span>
      ))}
    </div>
  )
}
