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
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/design-system/button'

import { ForgotPasswordForm } from './components/forgot-password-form'

type ForgotPasswordContentProps = {
  onBackToSignIn: () => void
}

export function ForgotPasswordContent(props: ForgotPasswordContentProps) {
  const { t } = useTranslation()

  return (
    <div className='flex flex-1 flex-col'>
      <Button
        type='button'
        variant='ghost'
        className='mb-6 self-start'
        onClick={props.onBackToSignIn}
      >
        <HugeiconsIcon
          icon={ArrowLeft01Icon}
          strokeWidth={2}
          data-icon='inline-start'
        />
        {t('Back to login')}
      </Button>

      <div className='flex flex-col gap-3'>
        <h2 className='text-2xl font-semibold tracking-tight'>
          {t('Forgot password')}
        </h2>
        <p className='text-muted-foreground text-sm sm:text-base'>
          {t(
            'Enter your registered email and we will send you a link to reset your password.'
          )}
        </p>
      </div>

      <ForgotPasswordForm className='mt-8' />
    </div>
  )
}
