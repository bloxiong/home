import { useCallback, useEffect, useState } from 'react'
import { api } from './api'

/**
 * Load JSON from the API; reloads whenever `path` or `params` change.
 * Old data stays visible while a reload is in flight.
 */
export function useApi(path, params) {
  const [tick, setTick] = useState(0)
  const key = path ? JSON.stringify([path, params || {}, tick]) : null
  const [state, setState] = useState({ data: null, error: null, key: null })

  useEffect(() => {
    if (!key) return
    let alive = true
    const [p, ps] = JSON.parse(key)
    api(p, { params: ps })
      .then((data) => { if (alive) setState({ data, error: null, key }) })
      .catch((error) => { if (alive) setState((s) => ({ ...s, error, key })) })
    return () => { alive = false }
  }, [key])

  const reload = useCallback(() => setTick((t) => t + 1), [])
  const setData = useCallback((fn) => setState((s) => ({ ...s, data: typeof fn === 'function' ? fn(s.data) : fn })), [])
  return { data: state.data, error: state.error, loading: !!key && state.key !== key, reload, setData }
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
