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
        'relative z-10 flex flex-col overflow-hidden px-6 pt-24 pb-16 md:pt-32 md:pb-24 lg:pt-36 lg:pb-28',
        props.className
      )}
    >
      {/* Radial gradient background */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 -z-10 opacity-25 dark:opacity-[0.12]'
        style={{
          background: [
            'radial-gradient(ellipse 60% 50% at 20% 20%, oklch(0.72 0.18 250 / 80%) 0%, transparent 70%)',
            'radial-gradient(ellipse 50% 40% at 80% 15%, oklch(0.65 0.15 200 / 60%) 0%, transparent 70%)',
            'radial-gradient(ellipse 40% 35% at 40% 80%, oklch(0.70 0.12 280 / 40%) 0%, transparent 70%)',
          ].join(', '),
        }}
      />
      {/* Grid pattern */}
      <div
        aria-hidden
        className='absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,black_20%,transparent_100%)] bg-[size:4rem_4rem] opacity-[0.08]'
      />

      <div className='mx-auto flex w-full max-w-6xl flex-col items-center gap-12'>
        {/* Title, description, action buttons */}
        <div className='flex w-full flex-col items-start text-left'>
          <div className='w-full'>
            <h1
              className='landing-animate-fade-up text-[clamp(2.25rem,4.5vw,3.25rem)] leading-[1.15] font-bold tracking-tight lg:whitespace-nowrap'
              style={{ animationDelay: '0ms' }}
            >
              {t('Unified API Gateway for')}{' '}
              <span className='bg-gradient-to-r from-blue-400 via-violet-400 to-purple-500 bg-clip-text text-transparent'>
                {t('Vast Range of AI Models')}
              </span>
            </h1>
            <p
              className='landing-animate-fade-up text-muted-foreground/80 mt-5 text-base leading-relaxed opacity-0 md:text-[15px] lg:whitespace-nowrap'
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
