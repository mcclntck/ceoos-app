import { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react'
import type { ReactNode } from 'react'
import { CEOOS_USER } from '@/departments/departments.config'
import { STORAGE_KEYS, readJSON, writeJSON } from './persistence/localStorage'

export interface Identity {
  name: string
  initials: string
}

interface IdentityContextValue {
  identity: Identity | null
  setName: (name: string) => void
  clearIdentity: () => void
}

const IdentityContext = createContext<IdentityContextValue | null>(null)

function initialsFrom(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function IdentityProvider({ children }: { children: ReactNode }) {
  const [identity, setIdentity] = useState<Identity | null>(() => readJSON<Identity | null>(STORAGE_KEYS.identity, null))

  useEffect(() => {
    writeJSON(STORAGE_KEYS.identity, identity)
  }, [identity])

  const setName = useCallback((name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    setIdentity({ name: trimmed, initials: initialsFrom(trimmed) || CEOOS_USER.initials })
  }, [])

  const clearIdentity = useCallback(() => setIdentity(null), [])

  const value = useMemo(() => ({ identity, setName, clearIdentity }), [identity, setName, clearIdentity])

  return <IdentityContext.Provider value={value}>{children}</IdentityContext.Provider>
}

export function useIdentity(): IdentityContextValue {
  const ctx = useContext(IdentityContext)
  if (!ctx) throw new Error('useIdentity must be used within IdentityProvider')
  return ctx
}
