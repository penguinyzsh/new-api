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
import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'

import { saveAffiliateCode } from '@/features/auth/lib/storage'
import { Home } from '@/features/home'
import { useAuthDialogStore } from '@/stores/auth-dialog-store'

const searchSchema = z.object({
  aff: z.string().optional(),
})

export const Route = createFileRoute('/')({
  validateSearch: searchSchema,
  beforeLoad: ({ cause, search }) => {
    const affiliateCode = search.aff?.trim()
    if (!affiliateCode || cause === 'preload') return

    saveAffiliateCode(affiliateCode)
    useAuthDialogStore.getState().openDialog('sign-up')
    throw redirect({ to: '/', search: {}, replace: true })
  },
  component: Home,
})
