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
import { create } from 'zustand'

export type AuthMode = 'forgot-password' | 'sign-in' | 'sign-up'

type AuthDialogState = {
  isOpen: boolean
  mode: AuthMode
  redirectTo?: string
  openDialog: (mode?: AuthMode, redirectTo?: string) => void
  closeDialog: () => void
  setMode: (mode: AuthMode) => void
}

export const useAuthDialogStore = create<AuthDialogState>()((set) => ({
  isOpen: false,
  mode: 'sign-in',
  redirectTo: undefined,
  openDialog: (mode = 'sign-in', redirectTo) =>
    set({ isOpen: true, mode, redirectTo }),
  closeDialog: () => set({ isOpen: false }),
  setMode: (mode) => set({ mode }),
}))
