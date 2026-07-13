/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { lazy, Suspense, useEffect, useState } from 'react'

import { useAuthDialogStore } from '@/stores/auth-dialog-store'

import { loadAuthDialog } from './auth-dialog-loader'

const LazyAuthDialog = lazy(loadAuthDialog)

export function AuthDialogHost() {
  const open = useAuthDialogStore((state) => state.isOpen)
  const mode = useAuthDialogStore((state) => state.mode)
  const redirectTo = useAuthDialogStore((state) => state.redirectTo)
  const closeDialog = useAuthDialogStore((state) => state.closeDialog)
  const setMode = useAuthDialogStore((state) => state.setMode)
  const [hasOpened, setHasOpened] = useState(open)

  useEffect(() => {
    if (open) {
      setHasOpened(true)
    }
  }, [open])

  if (!open && !hasOpened) {
    return null
  }

  return (
    <Suspense fallback={null}>
      <LazyAuthDialog
        open={open}
        mode={mode}
        redirectTo={redirectTo}
        onModeChange={setMode}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            closeDialog()
          }
        }}
      />
    </Suspense>
  )
}
