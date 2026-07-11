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

import { Tabs, TabsList, TabsTrigger } from '@/components/design-system/tabs'
import { PublicPageHeader } from '@/components/layout'

import {
  isRankingPeriod,
  RANKING_PERIODS,
  type RankingPeriod,
} from '../types'

const PERIOD_LABELS: Record<RankingPeriod, string> = {
  today: 'Today',
  week: 'Week',
  month: 'Month',
  year: 'Year',
}

type RankingsHeroProps = {
  period: RankingPeriod
  onPeriodChange: (period: RankingPeriod) => void
}

export function RankingsHero(props: RankingsHeroProps) {
  const { t } = useTranslation()

  return (
    <PublicPageHeader
      title={t('Rankings')}
      description={t(
        'Discover the most-used models and rising vendors on the platform, updated from live usage data.'
      )}
    >
      <Tabs
        value={props.period}
        onValueChange={(value) => {
          if (isRankingPeriod(value)) {
            props.onPeriodChange(value)
          }
        }}
      >
        <TabsList
          variant='line'
          aria-label={t('Period')}
          className='w-full justify-start gap-6 overflow-x-auto overflow-y-hidden border-b p-0'
        >
          {RANKING_PERIODS.map((period) => (
            <TabsTrigger
              key={period}
              value={period}
              className='flex-none px-0.5 pb-3'
            >
              {t(PERIOD_LABELS[period])}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </PublicPageHeader>
  )
}
