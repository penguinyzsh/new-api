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
import { LogOut } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { SignOutDialog } from '@/components/sign-out-dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function SignOutCard() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Card data-card-hover='false' className='gap-0 overflow-hidden py-0'>
        <CardHeader className='p-3 sm:p-5'>
          <CardTitle className='text-lg tracking-tight sm:text-xl'>
            {t('Sign out')}
          </CardTitle>
          <CardDescription className='text-xs sm:text-sm'>
            {t('End your current session on this device')}
          </CardDescription>
        </CardHeader>

        <CardContent className='p-3 sm:p-5'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between xl:flex-col 2xl:flex-row'>
            <div className='flex items-start gap-4'>
              <div className='bg-muted rounded-md p-2'>
                <LogOut className='h-5 w-5' />
              </div>
              <div className='space-y-1'>
                <p className='font-medium'>{t('Sign out')}</p>
                <p className='text-muted-foreground text-sm'>
                  {t('You will need to sign in again to access your account')}
                </p>
              </div>
            </div>

            <Button
              variant='destructive'
              className='w-full sm:w-auto xl:w-full 2xl:w-auto'
              onClick={() => setOpen(true)}
            >
              {t('Sign out')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <SignOutDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
