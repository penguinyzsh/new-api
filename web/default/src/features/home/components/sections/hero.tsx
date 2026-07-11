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
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

interface HeroProps {
  className?: string
}

export function Hero(props: HeroProps) {
  const { t } = useTranslation()

  return (
    <section
      className={cn(
        'text-foreground relative z-10 flex min-h-[30rem] flex-1 items-center justify-center overflow-hidden px-6 py-20 md:min-h-[34rem] dark:text-white',
        props.className
      )}
    >
      <div className='mx-auto flex w-full max-w-5xl flex-col items-center text-center'>
        <div className='flex w-full flex-col items-center'>
          <div className='w-full'>
            <h1
              className='landing-animate-fade-up text-[clamp(1.75rem,6.5vw,4.75rem)] leading-[1.08] font-semibold tracking-[-0.035em]'
              style={{ animationDelay: '0ms' }}
            >
              <span className='block'>{t('Unified API Gateway for')}</span>
              <span className='block bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 bg-clip-text text-transparent dark:from-cyan-300 dark:via-blue-300 dark:to-violet-300'>
                {t('Vast Range of AI Models')}
              </span>
            </h1>
            <p
              className='text-muted-foreground landing-animate-fade-up mx-auto mt-6 max-w-3xl text-sm leading-relaxed opacity-0 md:text-base dark:text-white/65'
              style={{ animationDelay: '60ms' }}
            >
              {t(
                'Access a vast selection of models via a standard, unified API protocol. Power AI applications, manage digital assets, and connect the Future.'
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
