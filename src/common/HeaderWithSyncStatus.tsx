import React from 'react'
import {SyncStatus} from './SyncStatus'
import {MiningStatus} from './MiningStatus'
import {Link} from './Link'
import './HeaderWithSyncStatus.scss'

interface HeaderWithSyncStatusProps {
  externalLink?: {
    text: string
    url: string
  }
}

export const HeaderWithSyncStatus = ({
  externalLink,
  children,
}: React.PropsWithChildren<HeaderWithSyncStatusProps>): JSX.Element => (
  <div className="HeaderWithSyncStatus">
    <div className="right">
      <SyncStatus />
      <div className="MiningStatus">
        <MiningStatus />
      </div>
    </div>
    <div className="main-title">
      {children}
      {externalLink && (
        <div className="external-link">
          <Link href={externalLink.url} popoverPlacement="right" styled>
            {externalLink.text}
          </Link>
        </div>
      )}
    </div>
  </div>
)
