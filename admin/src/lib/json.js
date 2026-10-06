/** Helpers for the generic content editor and the activity diff. */

/** An empty value with the same shape (strings → '', numbers → 0 …). Keeps `type`-like discriminators. */
export function blankLike(v, key) {
  if (Array.isArray(v)) return []
  if (v && typeof v === 'object') {
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, blankLike(x, k)]))
  }
  if (typeof v === 'string') return key === 'type' || key === 'kind' ? v : ''
  if (typeof v === 'number') return 0
  if (typeof v === 'boolean') return false
  return v ?? ''
}

export function isImageField(name, value, images) {
  if (name === 'img' || name === 'image' || name === 'photo') return true
  return typeof value === 'string' && !!value && Object.values(images || {}).includes(value)
}

const TITLE_KEYS = ['title', 'name', 'label', 'q', 'heading', 'verb', 'display', 'slug', 'key', 'id', 'type', 'text', 'value']

/** A short human title for an array item (shown when collapsed). */
export function itemTitle(item) {
  if (item == null) return ''
  if (typeof item !== 'object') return String(item).slice(0, 80)
  for (const k of TITLE_KEYS) {
    const v = item[k]
    if (typeof v === 'string' && v.trim()) {
      const t = v.length > 80 ? `${v.slice(0, 80)}…` : v
      if (k === 'type') {
        const name = BLOCK_NAMES[v] || v
        if (typeof item.text === 'string') return `${name} · ${item.text.slice(0, 60)}`
        if (Array.isArray(item.items)) return `${name} · ${item.items.length} items`
        return name
      }
      return t
    }
    if (typeof v === 'number' && k === 'value') return `${v}${item.label ? ` ${item.label}` : ''}`
  }
  return ''
}

const BLOCK_NAMES = { p: 'Paragraph', h: 'Heading', h2: 'Heading', h3: 'Subheading', list: 'List', quote: 'Quote', img: 'Image' }

/**
 * Distinct item shapes in a list, so "Add" can offer each kind
 * (e.g. article body blocks: paragraph, heading, list).
 */
export function templatesFor(list) {
  const out = new Map()
  for (const item of list) {
    let sig, label
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      const keys = Object.keys(item).sort().join(',')
      const disc = typeof item.type === 'string' ? item.type : typeof item.kind === 'string' ? item.kind : ''
      sig = `${keys}|${disc}`
      label = BLOCK_NAMES[disc] || disc || `${Object.keys(item).slice(0, 3).join(' / ')}`
    } else {
      sig = typeof item
      label = typeof item
    }
    if (!out.has(sig)) out.set(sig, { label, sample: item })
  }
  return [...out.values()]
}

/* ── diff ──────────────────────────────────────────────────────────── */
function isPlain(v) {
  return v && typeof v === 'object'
}

/** Flatten JSON into "path → primitive" pairs. */
export function flatten(v, prefix = '', out = {}) {
  if (Array.isArray(v)) {
    if (!v.length) out[prefix || '(root)'] = '[]'
    v.forEach((x, i) => flatten(x, `${prefix}[${i}]`, out))
  } else if (isPlain(v)) {
    const entries = Object.entries(v)
    if (!entries.length) out[prefix || '(root)'] = '{}'
    entries.forEach(([k, x]) => flatten(x, prefix ? `${prefix}.${k}` : k, out))
  } else {
    out[prefix || '(root)'] = v
  }
  return out
}

/** Changed paths between two JSON values: [{path, before, after, kind}] */
export function diffPaths(before, after) {
  const a = flatten(before ?? {})
  const b = flatten(after ?? {})
  const keys = Array.from(new Set([...Object.keys(a), ...Object.keys(b)]))
  const out = []
  for (const k of keys) {
    const inA = k in a
    const inB = k in b
    if (inA && inB && JSON.stringify(a[k]) === JSON.stringify(b[k])) continue
    out.push({ path: k, before: a[k], after: b[k], kind: !inA ? 'added' : !inB ? 'removed' : 'changed' })
  }
  return out
}

/** Unified line diff (LCS) of two texts; returns [{op: ' '|'-'|'+', line}]. */
export function lineDiff(aText, bText) {
  const a = aText.split('\n')
  const b = bText.split('\n')
  const n = a.length
  const m = b.length
  if (n * m > 4_000_000) {
    return [...a.map((line) => ({ op: '-', line })), ...b.map((line) => ({ op: '+', line }))]
  }
  const dp = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }
  const out = []
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (a[i] === b[j]) { out.push({ op: ' ', line: a[i] }); i++; j++ }
    else if (dp[i + 1][j] >= dp[i][j + 1]) out.push({ op: '-', line: a[i++] })
    else out.push({ op: '+', line: b[j++] })
  }
  while (i < n) out.push({ op: '-', line: a[i++] })
  while (j < m) out.push({ op: '+', line: b[j++] })
  return out
}
