import React from 'react'
import {isNone} from 'fp-ts/lib/Option'
import {BackendState} from './backend-state'
import {useInterval} from './hook-utils'
import {Trans} from './Trans'
import {useFormatters} from '../settings-state'
import './MiningStatus.scss'

export const MiningStatus = (): JSX.Element => {
  const {isMining, hashrate, refresh} = BackendState.useContainer()
  const {formatHashrate} = useFormatters()
  useInterval(() => refresh(), 5000)

  if (isNone(isMining) || isNone(hashrate))
    return <Trans k={['wallet', 'miningStatus', 'loadingMiningStatus']} />
  if (!isMining.value) return <Trans k={['wallet', 'miningStatus', 'notMining']} />
  if (hashrate.value < 0) return <Trans k={['wallet', 'miningStatus', 'invalidHashrate']} />
  return (
    <Trans
      k={['wallet', 'miningStatus', 'miningAtHashrate']}
      values={{hashrate: formatHashrate(hashrate.value)}}
    />
  )
}
