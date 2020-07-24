import React from 'react'
import {isNone} from 'fp-ts/lib/Option'
import {toHumanReadableHashrate} from './util'
import {BackendState} from './backend-state'
import {useInterval} from './hook-utils'
import {Trans} from './Trans'
import './MiningStatus.scss'

export const MiningStatus = (): JSX.Element => {
  const {isMining, hashrate, refresh} = BackendState.useContainer()
  useInterval(() => refresh(), 5000)

  if (isNone(isMining) || isNone(hashrate))
    return <Trans k={['wallet', 'miningStatus', 'loadingMiningStatus']} />
  if (!isMining.value) return <Trans k={['wallet', 'miningStatus', 'notMining']} />
  if (hashrate.value < 0) return <Trans k={['wallet', 'miningStatus', 'invalidHashrate']} />
  return (
    <Trans
      k={['wallet', 'miningStatus', 'miningAtHashrate']}
      values={{hashrate: toHumanReadableHashrate(hashrate.value)}}
    />
  )
}
