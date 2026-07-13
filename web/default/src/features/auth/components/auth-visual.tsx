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
import authBackgroundPassword from '@/assets/auth-background-password.webp'
import authBackground from '@/assets/auth-background.webp'
import { cn } from '@/lib/utils'

type AuthVisualProps = {
  privacyMode: boolean
}

const imageClassName =
  'pointer-events-none absolute inset-0 size-full select-none object-contain object-right-bottom transition-opacity duration-150 motion-reduce:transition-none'

export function AuthVisual(props: AuthVisualProps) {
  return (
    <div className='relative hidden min-h-[560px] md:block'>
      <div
        aria-hidden='true'
        className='bg-border absolute inset-y-8 left-0 w-px'
      />
      <div className='absolute top-8 right-0 bottom-0 left-6 overflow-hidden'>
        <img
          src={authBackground}
          alt=''
          width={1055}
          height={1490}
          draggable={false}
          className={cn(imageClassName, props.privacyMode && 'opacity-0')}
        />
        <img
          src={authBackgroundPassword}
          alt=''
          width={1055}
          height={1490}
          draggable={false}
          className={cn(imageClassName, !props.privacyMode && 'opacity-0')}
        />
      </div>
    </div>
  )
}
