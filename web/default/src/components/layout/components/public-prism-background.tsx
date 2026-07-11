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
import { Prism } from '@/components/ui/prism/Prism'
import { cn } from '@/lib/utils'

type PublicPrismBackgroundProps = {
  className?: string
}

export function PublicPrismBackground(props: PublicPrismBackgroundProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 -z-10 opacity-100 dark:opacity-55',
        props.className
      )}
    >
      <Prism
        animationType='3drotate'
        timeScale={0.2}
        height={3.5}
        baseWidth={4}
        scale={2.2}
        offset={{ y: 90 }}
        hueShift={-0.0416}
        colorFrequency={1}
        noise={0}
        glow={1}
        bloom={1.15}
        suspendWhenOffscreen
      />
    </div>
  )
}
