import React from 'react'
import {EmptyProps} from 'antd/lib/empty'
import {SyncStatus} from '../common/SyncStatus'
import './HeaderWithSyncStatus.scss'

export const HeaderWithSyncStatus = ({
  children,
}: React.PropsWithChildren<EmptyProps>): JSX.Element => (
  <div className="HeaderWithSyncStatus">
    <SyncStatus />
    <div className="main-title">{children}</div>
  </div>
)
