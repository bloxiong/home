import { useCallback, useEffect, useState } from 'react'
import { api, cached, remember } from './api'

/**
 * Load JSON from the API; reloads whenever `path` or `params` change.
 * Old data stays visible while a reload is in flight.
 */
export function useApi(path, params) {
  const [tick, setTick] = useState(0)
  const key = path ? JSON.stringify([path, params || {}, tick]) : null
  const cacheKey = path ? JSON.stringify([path, params || {}]) : null
  // what was last seen shows at once while the fresh copy loads
  const [state, setState] = useState(() => ({ data: cached(cacheKey) ?? null, error: null, key: null, cacheKey }))

  useEffect(() => {
    if (!key) return
    let alive = true
    const [p, ps] = JSON.parse(key)
    api(p, { params: ps })
      .then((data) => {
        remember(cacheKey, data)
        if (alive) setState({ data, error: null, key, cacheKey })
      })
      .catch((error) => { if (alive) setState((s) => ({ ...s, error, key })) })
    return () => { alive = false }
  }, [key, cacheKey])

  const reload = useCallback(() => setTick((t) => t + 1), [])
  const setData = useCallback((fn) => setState((s) => {
    const data = typeof fn === 'function' ? fn(s.data) : fn
    remember(s.cacheKey, data)
    return { ...s, data }
  }), [])
  // moving between lists: the new one's last copy, or nothing rather than the wrong list
  const shown = state.cacheKey === cacheKey ? state.data : (cached(cacheKey) ?? (state.key === key ? state.data : null))
  return { data: shown, error: state.error, loading: !!key && state.key !== key, reload, setData }
}

/** Debounce a value (search boxes). */
export function useDebounced(value, ms = 300) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}
