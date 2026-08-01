import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

interface UiContextValue {
  avatarMenuOpen: boolean
  setAvatarMenuOpen: (open: boolean) => void
  resetConfirmOpen: boolean
  setResetConfirmOpen: (open: boolean) => void
}

const UiContext = createContext<UiContextValue | null>(null)

export function UiProvider({ children }: { children: ReactNode }) {
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)

  const value = useMemo(
    () => ({ avatarMenuOpen, setAvatarMenuOpen, resetConfirmOpen, setResetConfirmOpen }),
    [avatarMenuOpen, resetConfirmOpen],
  )

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>
}

export function useUi(): UiContextValue {
  const ctx = useContext(UiContext)
  if (!ctx) throw new Error('useUi must be used within UiProvider')
  return ctx
}
