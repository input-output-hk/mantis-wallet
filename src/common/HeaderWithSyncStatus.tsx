import React from 'react'
import {EmptyProps} from 'antd/lib/empty'
import {SyncStatus} from './SyncStatus'
import {MiningStatus} from './MiningStatus'
import './HeaderWithSyncStatus.scss'

export const HeaderWithSyncStatus = ({
  children,
}: React.PropsWithChildren<EmptyProps>): JSX.Element => (
  <div className="HeaderWithSyncStatus">
    <div className="right">
      <SyncStatus />
      <div className="MiningStatus">
        <MiningStatus />
      </div>
    </div>
    <div className="main-title">{children}</div>
  </div>
)
