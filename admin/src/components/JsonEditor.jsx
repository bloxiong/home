import { useState } from 'react'
import { ArrowDown, ArrowUp, ChevronRight, Copy, ImageIcon, Plus, Trash2 } from 'lucide-react'
import { cx } from '../lib/cx'
import { UNSPLASH } from '../lib/constants'
import { humanize } from '../lib/format'
import { blankLike, isImageField, itemTitle, templatesFor } from '../lib/json'
import { Button, IconButton, Input, Modal, Textarea, Toggle } from './ui'

/* ── image picker (ids come from the _IMAGES section) ──────────────── */
function ImageField({ value, onChange, images, label }) {
  const [open, setOpen] = useState(false)
  const [custom, setCustom] = useState('')
  const name = Object.entries(images).find(([, id]) => id === value)?.[0]
  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={() => setOpen(true)} aria-label={`Change ${label}`}
        className="group relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-line bg-sunken">
        {value ? <img src={UNSPLASH(value, 240)} alt="" className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
          : <ImageIcon className="m-auto h-5 w-5 text-muted" aria-hidden />}
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{name ? humanize(name) : value ? 'Custom photo' : 'No photo'}</p>
        <p className="truncate font-mono text-[11px] text-muted">{value || '—'}</p>
        <Button size="sm" className="mt-1.5" onClick={() => setOpen(true)}>Choose photo</Button>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title={`Choose ${label.toLowerCase()}`} wide>
        <div className="grid max-h-[60vh] grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
          {Object.entries(images).map(([n, id]) => (
            <button key={n} type="button" onClick={() => { onChange(id); setOpen(false) }}
              className={cx('overflow-hidden rounded-xl border text-left transition', id === value ? 'border-accent ring-2 ring-accent/40' : 'border-line hover:border-accent/60')}>
              <img src={UNSPLASH(id)} alt="" className="aspect-[4/3] w-full object-cover" loading="lazy" />
              <span className="block truncate px-2 py-1.5 text-xs font-bold">{humanize(n)}</span>
            </button>
          ))}
        </div>
        <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (custom.trim()) { onChange(custom.trim().replace(/^.*photo-/, '').replace(/\?.*$/, '')); setOpen(false); setCustom('') } }}>
          <Input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Or paste an Unsplash photo ID / images.unsplash.com URL" aria-label="Custom Unsplash photo ID" />
          <Button type="submit" disabled={!custom.trim()}>Use</Button>
        </form>
      </Modal>
    </div>
  )
}

/* ── primitives ────────────────────────────────────────────────────── */
function StringField({ id, value, onChange }) {
  const long = value.length > 80 || value.includes('\n')
  if (long) {
    const rows = Math.min(14, Math.max(3, Math.ceil(value.length / 90) + (value.match(/\n/g) || []).length))
    return <Textarea id={id} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
  }
  return <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} />
}

function Leaf({ id, name, value, onChange, images }) {
  if (typeof value === 'boolean') return <Toggle id={id} checked={value} onChange={onChange} label={value ? 'Yes' : 'No'} />
  if (typeof value === 'number') {
    return <Input id={id} type="number" step="any" value={Number.isFinite(value) ? value : ''} className="max-w-48"
      onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))} />
  }
  if (isImageField(name, value, images)) return <ImageField value={value || ''} onChange={onChange} images={images} label={humanize(name) || 'Image'} />
  return <StringField id={id} value={value == null ? '' : String(value)} onChange={onChange} />
}

/* ── objects ───────────────────────────────────────────────────────── */
function ObjectFields({ value, onChange, images, path }) {
  return (
    <div className="space-y-5">
      {Object.entries(value).map(([k, v]) => (
        <Node key={k} name={k} value={v} images={images} path={`${path}.${k}`}
          onChange={(nv) => onChange({ ...value, [k]: nv })} />
      ))}
    </div>
  )
}

/* ── arrays ────────────────────────────────────────────────────────── */
function ArrayField({ name, value, onChange, images, path }) {
  const [open, setOpen] = useState(() => value.map(() => value.length <= 1))
  const objects = value.length > 0 && value.every((v) => v && typeof v === 'object' && !Array.isArray(v))
  const templates = templatesFor(value)
  const [adding, setAdding] = useState(false)

  const isOpen = (i) => open[i] ?? true
  const set = (i, nv) => onChange(value.map((v, j) => (j === i ? nv : v)))
  const move = (i, d) => {
    const j = i + d
    if (j < 0 || j >= value.length) return
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]]
    const o = value.map((_, k) => isOpen(k));
    [o[i], o[j]] = [o[j], o[i]]
    setOpen(o)
    onChange(next)
  }
  const remove = (i) => {
    setOpen(value.map((_, k) => isOpen(k)).filter((_, k) => k !== i))
    onChange(value.filter((_, k) => k !== i))
  }
  const duplicate = (i) => {
    const o = value.map((_, k) => isOpen(k))
    o.splice(i + 1, 0, true)
    setOpen(o)
    onChange([...value.slice(0, i + 1), structuredClone(value[i]), ...value.slice(i + 1)])
  }
  const add = (tpl) => {
    setOpen([...value.map((_, k) => isOpen(k)), true])
    onChange([...value, tpl])
    setAdding(false)
  }
  const singular = humanize(name).replace(/ies$/, 'y').replace(/s$/, '') || 'item'

  const controls = (i) => (
    <div className="flex shrink-0 items-center">
      <IconButton icon={ArrowUp} label="Move up" disabled={i === 0} onClick={() => move(i, -1)} compact />
      <IconButton icon={ArrowDown} label="Move down" disabled={i === value.length - 1} onClick={() => move(i, 1)} compact />
      <IconButton icon={Copy} label="Duplicate" onClick={() => duplicate(i)} compact />
      <IconButton icon={Trash2} label="Remove" onClick={() => remove(i)} compact className="hover:text-danger" />
    </div>
  )

  return (
    <div className="space-y-2">
      {value.length === 0 && <p className="rounded-xl border border-dashed border-line px-3 py-3 text-sm text-muted">Empty list.</p>}
      {value.map((item, i) => (
        objects || (item && typeof item === 'object') ? (
          <div key={i} className="rounded-xl border border-line bg-canvas/40">
            <div className="flex items-center gap-1 py-1 pl-2 pr-1">
              <button type="button" onClick={() => setOpen(value.map((_, k) => (k === i ? !isOpen(k) : isOpen(k))))} aria-expanded={isOpen(i)} aria-label={`${singular} ${i + 1}: ${itemTitle(item) || 'untitled'}`}
                className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1 py-1.5 text-left">
                <ChevronRight className={cx('h-4 w-4 shrink-0 text-muted transition', isOpen(i) && 'rotate-90')} aria-hidden />
                <span className="font-mono text-[11px] text-muted">{String(i + 1).padStart(2, '0')}</span>
                <span className="truncate text-sm font-bold">{itemTitle(item) || `${singular} ${i + 1}`}</span>
              </button>
              {controls(i)}
            </div>
            {isOpen(i) && (
              <div className="border-t border-line p-3 sm:p-4">
                <Node value={item} images={images} path={`${path}[${i}]`} onChange={(nv) => set(i, nv)} bare />
              </div>
            )}
          </div>
        ) : (
          <div key={i} className="flex items-start gap-1">
            <span className="w-7 shrink-0 pt-2.5 text-right font-mono text-[11px] text-muted">{String(i + 1).padStart(2, '0')}</span>
            <div className="min-w-0 flex-1"><Leaf id={`${path}[${i}]`} name={name} value={item} images={images} onChange={(nv) => set(i, nv)} /></div>
            <div className="pt-1">{controls(i)}</div>
          </div>
        )
      ))}
      <div className="flex flex-wrap items-center gap-2">
        {templates.length > 1 ? (
          adding ? (
            <>
              <span className="text-xs text-muted">Add a:</span>
              {templates.map((t) => <Button key={t.label} size="sm" icon={Plus} onClick={() => add(blankLike(t.sample))}>{t.label}</Button>)}
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
            </>
          ) : <Button size="sm" icon={Plus} onClick={() => setAdding(true)}>Add {singular.toLowerCase()}</Button>
        ) : (
          <Button size="sm" icon={Plus} onClick={() => add(templates[0] ? blankLike(templates[0].sample) : '')}>Add {singular.toLowerCase()}</Button>
        )}
      </div>
    </div>
  )
}

/* ── recursive node ────────────────────────────────────────────────── */
export function Node({ name, value, onChange, images, path = '$', bare }) {
  const label = name !== undefined ? humanize(name) : null
  const id = `f-${path.replace(/[^\w-]/g, '_')}`
  const isArr = Array.isArray(value)
  const isObj = value && typeof value === 'object' && !isArr

  if (isObj) {
    const inner = <ObjectFields value={value} onChange={onChange} images={images} path={path} />
    if (bare || !label) return inner
    return (
      <fieldset className="rounded-xl border border-line p-3 sm:p-4">
        <legend className="text-label px-1.5 text-muted">{label}</legend>
        {inner}
      </fieldset>
    )
  }
  if (isArr) {
    const inner = <ArrayField name={name || 'item'} value={value} onChange={onChange} images={images} path={path} />
    if (!label) return inner
    return (
      <div>
        <p className="text-label mb-1.5 text-muted">{label} <span className="normal-case tracking-normal">· {value.length}</span></p>
        {inner}
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={id} className="text-label text-muted">{label}</label>}
      <Leaf id={id} name={name} value={value} images={images} onChange={onChange} />
    </div>
  )
}

export default function JsonEditor({ value, onChange, images, sectionKey }) {
  return <Node value={value} onChange={onChange} images={images} path={sectionKey || '$'} name={Array.isArray(value) ? sectionKey : undefined} />
}
