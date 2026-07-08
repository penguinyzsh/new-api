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
import { Database, HardDrive, Server } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { StatusBadge } from '@/components/status-badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import type { SetupStatus } from '../types'

interface DatabaseStepProps {
  status?: SetupStatus
}

function resolveDatabaseMeta(type?: string) {
  if (!type) return null
  const normalized = type.toLowerCase()
  if (normalized === 'postgres') {
    return {
      label: 'PostgreSQL',
      descriptionKey:
        'PostgreSQL is configured as the required database for this project.',
      variant: 'success' as const,
    }
  }
  return {
    label: type,
    descriptionKey:
      'This project now requires PostgreSQL. Update your database configuration before continuing.',
    variant: 'warning' as const,
  }
}

export function DatabaseStep({ status }: DatabaseStepProps) {
  const { t } = useTranslation()
  const meta = resolveDatabaseMeta(status?.database_type)
  const electronApi =
    typeof window !== 'undefined'
      ? ((window as unknown as Record<string, unknown>)?.electron as
          | Record<string, unknown>
          | undefined)
      : undefined
  const isElectron = Boolean(electronApi?.isElectron)
  const electronDataDir = electronApi?.dataDir as string | undefined

  return (
    <div className='space-y-4'>
      <div className='bg-card flex items-center justify-between rounded-lg border p-4'>
        <div className='space-y-1'>
          <p className='text-muted-foreground text-sm font-medium'>
            {t('Detected database')}
          </p>
          <p className='text-foreground text-base font-semibold'>
            {meta?.label ?? t('Unknown')}
          </p>
          <p className='text-muted-foreground text-sm'>
            {t(
              meta?.descriptionKey ??
                'The setup wizard will use this database during initialization.'
            )}
          </p>
        </div>
        <StatusBadge
          label={meta?.label ?? t('Unknown')}
          variant={meta?.variant ?? 'info'}
          className='cursor-default'
          copyable={false}
          icon={Database}
        />
      </div>

      {status?.database_type === 'postgres' && (
        <Alert className='border-sky-200 bg-sky-50 dark:border-sky-900/60 dark:bg-sky-950/40'>
          <AlertTitle className='flex items-center gap-2'>
            <Server className='size-4 text-sky-500' />
            {t('PostgreSQL detected')}
          </AlertTitle>
          <AlertDescription>
            <p>
              {t(
                'Review your backup, retention, and maintenance settings before going live.'
              )}
            </p>
          </AlertDescription>
        </Alert>
      )}

      {status?.database_type && status.database_type !== 'postgres' && (
        <Alert className='border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/40'>
          <AlertTitle className='flex items-center gap-2'>
            <HardDrive className='size-4 text-amber-500' />
            {t('Unsupported database configuration')}
          </AlertTitle>
          <AlertDescription>
            <p>
              {t('This setup flow is designed for PostgreSQL deployments.')}
            </p>
            {isElectron && electronDataDir && (
              <p className='mt-3 rounded-md bg-amber-100/70 px-3 py-2 font-mono text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-200'>
                {t('Data directory:')} {electronDataDir}
              </p>
            )}
            {isElectron && !electronDataDir && (
              <p className='text-muted-foreground mt-3 text-xs'>
                {t(
                  'Data is stored locally on this device. Use system backups to keep a safe copy.'
                )}
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
