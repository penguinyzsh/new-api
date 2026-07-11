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
import { useState, type FocusEvent } from 'react'
import { useTranslation } from 'react-i18next'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/design-system/dialog'
import { useStatus } from '@/hooks/use-status'
import { cn } from '@/lib/utils'

import { UserAuthForm } from '../sign-in/components/user-auth-form'
import { SignUpForm } from '../sign-up/components/sign-up-form'
import { AuthVisual } from './auth-visual'
import { TermsFooter } from './terms-footer'

export type AuthMode = 'sign-in' | 'sign-up'

type AuthDialogProps = {
  mode: AuthMode
  open: boolean
  redirectTo?: string
  onModeChange: (mode: AuthMode) => void
  onOpenChange: (open: boolean) => void
}

export function AuthDialog(props: AuthDialogProps) {
  const { t } = useTranslation()
  const { status } = useStatus()
  const [privacyMode, setPrivacyMode] = useState(false)
  const canRegister =
    !status?.self_use_mode_enabled && status?.register_enabled !== false
  const mode = canRegister ? props.mode : 'sign-in'
  const isSignIn = mode === 'sign-in'

  const handleFocusCapture = (event: FocusEvent<HTMLDivElement>) => {
    setPrivacyMode(Boolean(event.target.closest('[data-sensitive-field]')))
  }

  const handleBlurCapture = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.relatedTarget?.closest('[data-sensitive-field]')) {
      setPrivacyMode(false)
    }
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className='bg-background text-foreground ring-border data-open:slide-in-from-bottom-3 data-closed:slide-out-to-bottom-2 max-h-[calc(100svh-2rem)] overflow-y-auto border-0 p-0 shadow-2xl ring-1 duration-200 ease-out data-closed:ease-in motion-reduce:animate-none sm:max-w-4xl'>
        <DialogHeader className='sr-only'>
          <DialogTitle>
            {isSignIn ? t('Sign in') : t('Create an account')}
          </DialogTitle>
          <DialogDescription>
            {isSignIn ? t('Sign in') : t('Sign up')}
          </DialogDescription>
        </DialogHeader>

        <div
          className='grid min-h-[560px] md:grid-cols-[1.05fr_0.95fr]'
          onFocusCapture={handleFocusCapture}
          onBlurCapture={handleBlurCapture}
        >
          <div className='flex min-h-[560px] flex-col gap-6 p-6 md:p-8'>
            {canRegister && (
              <nav
                aria-label={t('Authentication')}
                className='bg-muted grid grid-cols-2 rounded-lg p-1'
              >
                <button
                  type='button'
                  aria-current={isSignIn ? 'page' : undefined}
                  onClick={() => props.onModeChange('sign-in')}
                  className={cn(
                    'rounded-md px-3 py-2 text-center text-sm font-medium transition-colors',
                    isSignIn
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t('Sign in')}
                </button>
                <button
                  type='button'
                  aria-current={isSignIn ? undefined : 'page'}
                  onClick={() => props.onModeChange('sign-up')}
                  className={cn(
                    'rounded-md px-3 py-2 text-center text-sm font-medium transition-colors',
                    isSignIn
                      ? 'text-muted-foreground hover:text-foreground'
                      : 'bg-background text-foreground shadow-sm'
                  )}
                >
                  {t('Sign up')}
                </button>
              </nav>
            )}

            <div
              key={mode}
              className='animate-in fade-in-0 slide-in-from-right-2 flex flex-1 flex-col duration-200 motion-reduce:animate-none'
            >
              {isSignIn ? (
                <UserAuthForm
                  className='flex flex-1 flex-col'
                  redirectTo={props.redirectTo}
                />
              ) : (
                <SignUpForm className='flex flex-1 flex-col' />
              )}

              <TermsFooter
                variant={mode}
                status={status}
                className='mt-6 text-center'
              />
            </div>
          </div>

          <AuthVisual privacyMode={privacyMode} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
