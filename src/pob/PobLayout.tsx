import React from 'react'
import {HeaderWithSyncStatus} from '../common/HeaderWithSyncStatus'
import {LINKS} from '../external-link-config'
import {BackendState} from '../common/backend-state'
import {isTestnet} from '../shared/version'
import './PobLayout.scss'

interface PobLayoutProps {
  title: string
}

const TestnetWarning = (): JSX.Element => (
  <div className="warning">
    <div className="warning-content">
      <b>Warning:</b> This is a Testnet edition.
      <br />
      Do <b>NOT</b> burn real ETH or BTC for Proof of Burn.
    </div>
  </div>
)

export const PobLayout: React.FunctionComponent<PobLayoutProps> = ({
  title,
  children,
}: React.PropsWithChildren<PobLayoutProps>) => {
  const {networkTag} = BackendState.useContainer()

  return (
    <div className="PobLayout">
      {isTestnet(networkTag) && <TestnetWarning />}
      <HeaderWithSyncStatus
        externalLink={{text: 'Learn more about Proof of Burn', url: LINKS.aboutPoB}}
      >
        {title}
      </HeaderWithSyncStatus>
      <div className="content">{children}</div>
    </div>
  )
}
