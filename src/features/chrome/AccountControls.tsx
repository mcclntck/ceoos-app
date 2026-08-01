/* Ties the avatar menu + reset-confirm dialog together with the real reset action.
   A full page reload after resetAccount() is deliberate: every store's useReducer/
   useState only reads localStorage once on mount (see e.g. departmentsStore.tsx's
   readJSON in its useReducer initializer), so clearing keys underneath an already-
   mounted provider would not, by itself, reset in-memory state — reloading is the
   simplest way to guarantee every context reinitializes from the now-empty storage,
   matching the product intent of a full account reset. */
import { useIdentity } from '@/state/identityStore'
import { useUi } from '@/state/uiStore'
import { resetAccount } from '@/state/persistence/resetAccount'
import { AvatarMenu } from './AvatarMenu'
import { ResetConfirmDialog } from './ResetConfirmDialog'

export function AccountControls() {
  const { identity } = useIdentity()
  const { avatarMenuOpen, setAvatarMenuOpen, resetConfirmOpen, setResetConfirmOpen } = useUi()

  return (
    <>
      <AvatarMenu
        initials={identity?.initials ?? 'SJ'}
        open={avatarMenuOpen}
        onOpenChange={setAvatarMenuOpen}
        onRequestReset={() => setResetConfirmOpen(true)}
      />
      <ResetConfirmDialog
        open={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        onConfirm={() => {
          resetAccount()
          window.location.assign('/')
        }}
      />
    </>
  )
}
