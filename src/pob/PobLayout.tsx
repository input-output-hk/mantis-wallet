import React from 'react'
import {HeaderWithSyncStatus} from '../common/HeaderWithSyncStatus'
import './PobLayout.scss'

interface PobLayoutProps {
  title: string
}

export const PobLayout: React.FunctionComponent<PobLayoutProps> = ({
  title,
  children,
}: React.PropsWithChildren<PobLayoutProps>) => {
  return (
    <div className="PobLayout">
      <HeaderWithSyncStatus>
        {title}
        <div className="link">Learn more about Proof of Burn</div>
      </HeaderWithSyncStatus>
      <div className="content">{children}</div>
    </div>
  )
}
