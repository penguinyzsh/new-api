/*
Copyright (C) 2025 QuantumNous

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

import React from 'react';
import { Banner } from '@douyinfe/semi-ui';

/**
 * 数据库检查步骤组件
 * 显示当前数据库类型和相关警告信息
 */
const DatabaseStep = ({ setupStatus, renderNavigationButtons, t }) => {
  // 检测是否在 Electron 环境中运行
  const isElectron =
    typeof window !== 'undefined' && window.electron?.isElectron;

  return (
    <>
      {setupStatus.database_type === 'postgres' && (
        <Banner
          type='success'
          closeIcon={null}
          title={t('数据库信息')}
          description={
            <div>
              <p>
                {t(
                  '当前项目统一使用 PostgreSQL，请在上线前确认备份、保留策略与维护窗口配置。',
                )}
              </p>
            </div>
          }
          className='!rounded-lg'
          fullMode={false}
          bordered
        />
      )}

      {setupStatus.database_type && setupStatus.database_type !== 'postgres' && (
        <Banner
          type={isElectron ? 'info' : 'warning'}
          closeIcon={null}
          title={t('数据库要求')}
          description={
            <div>
              <p>
                {t(
                  '当前初始化流程仅面向 PostgreSQL 部署，请先调整数据库配置后再继续。',
                )}
              </p>
              {window.electron?.dataDir && (
                <p className='mt-2 text-sm opacity-80'>
                  <strong>{t('数据存储位置：')}</strong>
                  <br />
                  <code className='bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded'>
                    {window.electron.dataDir}
                  </code>
                </p>
              )}
            </div>
          }
          className='!rounded-lg'
          fullMode={false}
          bordered
        />
      )}
      {renderNavigationButtons && renderNavigationButtons()}
    </>
  );
};

export default DatabaseStep;
