import { createContext, useContext } from 'react'

export const AuthContext = createContext(null)
export const ToastContext = createContext(null)
export const CountsContext = createContext({ counts: null, refresh: () => {} })
export const ThemeContext = createContext({ theme: 'dark', toggle: () => {} })

export const useAuth = () => useContext(AuthContext)
export const useToast = () => useContext(ToastContext)
export const useCounts = () => useContext(CountsContext)
export const useTheme = () => useContext(ThemeContext)
