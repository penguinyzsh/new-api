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
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
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
import { MOTION_TRANSITION, MOTION_VARIANTS } from '@/lib/motion'
import { cn } from '@/lib/utils'
import type { AuthMode } from '@/stores/auth-dialog-store'

import { ForgotPasswordContent } from '../forgot-password'
import { UserAuthForm } from '../sign-in/components/user-auth-form'
import { SignUpForm } from '../sign-up/components/sign-up-form'
import { AuthVisual } from './auth-visual'
import { TermsFooter } from './terms-footer'

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
  const shouldReduceMotion = useReducedMotion()
  const [privacyMode, setPrivacyMode] = useState(false)
  const canRegister =
    !status?.self_use_mode_enabled && status?.register_enabled !== false
  const mode = !canRegister && props.mode === 'sign-up' ? 'sign-in' : props.mode
  const isForgotPassword = mode === 'forgot-password'
  const isSignIn = mode === 'sign-in'
  const isSignInSection = isSignIn || isForgotPassword

  let dialogTitle = t('Create an account')
  let dialogDescription = t('Sign up')
  if (isSignIn) {
    dialogTitle = t('Sign in')
    dialogDescription = t('Sign in')
  } else if (isForgotPassword) {
    dialogTitle = t('Forgot password')
    dialogDescription = t(
      'Enter your registered email and we will send you a link to reset your password.'
    )
  }

  const handleFocusCapture = (event: FocusEvent<HTMLDivElement>) => {
    setPrivacyMode(Boolean(event.target.closest('[data-sensitive-field]')))
  }

  const handleBlurCapture = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.relatedTarget?.closest('[data-sensitive-field]')) {
      setPrivacyMode(false)
    }
  }

  let formContent = <SignUpForm className='flex flex-1 flex-col' />
  if (isSignIn) {
    formContent = (
      <UserAuthForm
        className='flex flex-1 flex-col'
        redirectTo={props.redirectTo}
        onForgotPassword={() => props.onModeChange('forgot-password')}
      />
    )
  } else if (isForgotPassword) {
    formContent = (
      <ForgotPasswordContent
        onBackToSignIn={() => props.onModeChange('sign-in')}
      />
    )
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent
        keepMounted
        className='bg-background text-foreground ring-border max-h-[calc(100svh-2rem)] overflow-y-auto border-0 p-0 shadow-2xl ring-1 duration-150 motion-reduce:animate-none sm:max-w-[55rem]'
      >
        <DialogHeader className='sr-only'>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <div
          className='grid min-h-[560px] md:grid-cols-[minmax(0,1fr)_25rem]'
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
                  aria-current={isSignInSection ? 'page' : undefined}
                  onClick={() => props.onModeChange('sign-in')}
                  className={cn(
                    'rounded-md px-3 py-2 text-center text-sm font-medium transition-colors',
                    isSignInSection
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t('Sign in')}
                </button>
                <button
                  type='button'
                  aria-current={isSignInSection ? undefined : 'page'}
                  onClick={() => props.onModeChange('sign-up')}
                  className={cn(
                    'rounded-md px-3 py-2 text-center text-sm font-medium transition-colors',
                    isSignInSection
                      ? 'text-muted-foreground hover:text-foreground'
                      : 'bg-background text-foreground shadow-sm'
                  )}
                >
                  {t('Sign up')}
                </button>
              </nav>
            )}

            <div className='grid flex-1'>
              <AnimatePresence mode='wait' initial={false}>
                <motion.div
                  key={mode}
                  initial={
                    shouldReduceMotion ? false : MOTION_VARIANTS.fadeIn.initial
                  }
                  animate={MOTION_VARIANTS.fadeIn.animate}
                  exit={
                    shouldReduceMotion ? undefined : MOTION_VARIANTS.fadeIn.exit
                  }
                  transition={MOTION_TRANSITION.fast}
                  className='col-start-1 row-start-1 flex min-w-0 flex-col'
                >
                  {formContent}

                  {!isForgotPassword && (
                    <TermsFooter
                      variant={mode}
                      status={status}
                      className='mt-6 text-center'
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <AuthVisual privacyMode={privacyMode} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
