import React from 'react'
import BigNumber from 'bignumber.js'
import {isTestnet} from '../shared/version'
import {Trans} from '../common/Trans'
import {HeaderWithSyncStatus} from '../common/HeaderWithSyncStatus'
import {ShortNumber} from '../common/ShortNumber'
import {BackendState} from '../common/backend-state'
import './WalletOverview.scss'

interface WalletOverviewProps {
  availableBalance: BigNumber
}

export const WalletOverview = ({availableBalance}: WalletOverviewProps): JSX.Element => {
  const {networkType} = BackendState.useContainer()

  return (
    <div className="WalletOverview">
      <div className="header">
        <HeaderWithSyncStatus>
          <Trans k={['wallet', 'title', 'lunaMantis']} />
        </HeaderWithSyncStatus>
        {isTestnet(networkType) && <div>{networkType.value}</div>}
      </div>
      <div className="balances">
        Balance: <ShortNumber big={availableBalance} />
      </div>
    </div>
  )
}
