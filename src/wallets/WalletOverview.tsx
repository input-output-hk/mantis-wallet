import React, {useEffect, useState} from 'react'
import BigNumber from 'bignumber.js'
import CountUp from 'react-countup'
import {isTestnet} from '../shared/version'
import {ETC_CHAIN} from '../common/chains'
import {Trans} from '../common/Trans'
import {HeaderWithSyncStatus} from '../common/HeaderWithSyncStatus'
import {BackendState} from '../common/backend-state'
import './WalletOverview.scss'

interface WalletOverviewProps {
  availableBalance: BigNumber
}

export const WalletOverview = ({availableBalance}: WalletOverviewProps): JSX.Element => {
  const {networkType} = BackendState.useContainer()
  const etcAvailableBalance = availableBalance.shiftedBy(-ETC_CHAIN.decimals).toNumber()

  const [availableBalanceHistory, setAvailableBalanceHistory] = useState<[number, number]>([
    0,
    etcAvailableBalance,
  ])
  useEffect(() => {
    setAvailableBalanceHistory([availableBalanceHistory[1], etcAvailableBalance])
  }, [etcAvailableBalance])

  return (
    <div className="WalletOverview">
      <div className="header">
        <HeaderWithSyncStatus>
          <Trans k={['wallet', 'title', 'lunaMantis']} />
        </HeaderWithSyncStatus>
        {isTestnet(networkType) && (
          <div>
            {networkType.value} <Trans k={['wallet', 'label', 'network']} />
          </div>
        )}
      </div>
      <div className="balances">
        <div className="label">
          <Trans k={['wallet', 'label', 'availableBalance']} />
        </div>
        <CountUp
          start={availableBalanceHistory[0]}
          end={availableBalanceHistory[1]}
          duration={2}
          decimals={3}
          suffix={` ${ETC_CHAIN.symbol}`}
          className="available-balance"
        />
        {/* Balance: <ShortNumber big={availableBalance} /> */}
      </div>
    </div>
  )
}
