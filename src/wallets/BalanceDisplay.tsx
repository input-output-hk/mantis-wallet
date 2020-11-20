import React, {useEffect, useState} from 'react'
import {isNone, Option} from 'fp-ts/lib/Option'
import BigNumber from 'bignumber.js'
import CountUp from 'react-countup'
import {ETC_CHAIN} from '../common/chains'
import {Trans} from '../common/Trans'
import './BalanceDisplay.scss'

interface BalanceDisplayProps {
  availableBalance: Option<BigNumber>
}

export const BalanceDisplay = ({availableBalance}: BalanceDisplayProps): JSX.Element => {
  if (isNone(availableBalance)) return <></>

  const etcAvailableBalance = availableBalance.value.shiftedBy(-ETC_CHAIN.decimals).toNumber()

  const [availableBalanceHistory, setAvailableBalanceHistory] = useState<[number, number]>([
    0,
    etcAvailableBalance,
  ])

  useEffect(() => {
    if (etcAvailableBalance === availableBalanceHistory[1]) return
    setAvailableBalanceHistory([availableBalanceHistory[1], etcAvailableBalance])
  }, [etcAvailableBalance])

  return (
    <div className="BalanceDisplay">
      <div className="balances">
        <div className="label">
          <Trans k={['wallet', 'label', 'availableBalance']} />
        </div>
        <CountUp
          start={availableBalanceHistory[0]}
          end={availableBalanceHistory[1]}
          duration={2}
          decimals={2}
          className="available-balance"
        />
        <span className="suffix">{ETC_CHAIN.symbol}</span>
      </div>
    </div>
  )
}
