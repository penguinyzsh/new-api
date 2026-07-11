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
import { PublicLayout } from '@/components/layout'
import { PublicPrismBackground } from '@/components/layout/components/public-prism-background'
import { cn } from '@/lib/utils'

type AuthLayoutProps = {
  children: React.ReactNode
  className?: string
  contentClassName?: string
}

export function AuthLayout(props: AuthLayoutProps) {
  return (
    <PublicLayout showMainContainer={false}>
      <main className='relative isolate flex min-h-svh overflow-hidden bg-white transition-colors dark:bg-[#0d0c13]'>
        <PublicPrismBackground className='opacity-75 dark:opacity-40' />
        <div
          className={cn(
            'flex w-full items-center pt-20 sm:pt-16',
            props.className
          )}
        >
          <div
            className={cn(
              'mx-auto flex w-full flex-col justify-center gap-2 px-4 py-8 sm:w-[480px] sm:p-8',
              props.contentClassName
            )}
          >
            {props.children}
          </div>
        </div>
      </main>
    </PublicLayout>
  )
}
