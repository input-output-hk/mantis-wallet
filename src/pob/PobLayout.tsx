import React from 'react'
import {HeaderWithSyncStatus} from '../common/HeaderWithSyncStatus'
import {LINKS} from '../external-link-config'
import {Link} from '../common/Link'
import {LUNA_EDITION, TESTNET_EDITION} from '../shared/version'
import './PobLayout.scss'

interface PobLayoutProps {
  title: string
}

const TestnetWarning = (): JSX.Element => (
  <div className="warning">
    <div className="warning-content">
      <b>Warning:</b> This is a Testnet edition.
      <br />
      Do <b>NOT</b> burn real ETC or BTC for Proof of Burn.
    </div>
  </div>
)

export const PobLayout: React.FunctionComponent<PobLayoutProps> = ({
  title,
  children,
}: React.PropsWithChildren<PobLayoutProps>) => {
  return (
    <div className="PobLayout">
      {LUNA_EDITION === TESTNET_EDITION && <TestnetWarning />}
      <HeaderWithSyncStatus>
        {title}
        <div className="link">
          <Link href={LINKS.aboutPoB}>Learn more about Proof of Burn</Link>
        </div>
      </HeaderWithSyncStatus>
      <div className="content">{children}</div>
    </div>
  )
}
