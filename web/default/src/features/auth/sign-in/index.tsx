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
import { Link, useSearch } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { Card, CardContent } from '@/components/ui/card'
import { useStatus } from '@/hooks/use-status'

import { AuthLayout } from '../auth-layout'
import { TermsFooter } from '../components/terms-footer'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn() {
  const { t } = useTranslation()
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })
  const { status } = useStatus()

  return (
    <AuthLayout contentClassName='sm:w-full sm:max-w-4xl sm:p-6 md:p-10'>
      <Card className='bg-background/82 overflow-hidden border-white/30 p-0 shadow-2xl backdrop-blur-xl dark:border-white/10'>
        <CardContent className='grid p-0 md:grid-cols-2'>
          <div className='flex flex-col gap-8 p-6 md:p-8'>
            <div className='flex flex-col gap-2'>
              <h2 className='text-2xl font-semibold tracking-tight'>
                {t('Sign in')}
              </h2>
              {!status?.self_use_mode_enabled &&
                status?.register_enabled !== false && (
                  <p className='text-muted-foreground text-sm sm:text-base'>
                    {t("Don't have an account?")}{' '}
                    <Link
                      to='/sign-up'
                      className='hover:text-primary font-medium underline underline-offset-4'
                    >
                      {t('Sign up')}
                    </Link>
                    .
                  </p>
                )}
            </div>

            <UserAuthForm redirectTo={redirect} />

            <TermsFooter
              variant='sign-in'
              status={status}
              className='text-center'
            />
          </div>
          <div className='relative hidden min-h-[560px] overflow-hidden border-l border-white/20 md:block dark:border-white/10'>
            <div className='from-primary/20 to-primary/5 absolute inset-0 bg-gradient-to-br via-white/10' />
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
