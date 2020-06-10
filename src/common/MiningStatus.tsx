import React from 'react'
import {isNone} from 'fp-ts/lib/Option'
import {toHumanReadableHashrate} from './util'
import {BackendState} from './backend-state'
import {useInterval} from './hook-utils'
import './MiningStatus.scss'

export const MiningStatus = (): JSX.Element => {
  const {isMining, hashrate, refresh} = BackendState.useContainer()
  useInterval(() => refresh(), 5000)

  if (isNone(isMining) || isNone(hashrate)) return <>Loading mining status</>
  if (!isMining.value) return <>Not mining</>
  return <>Mining {toHumanReadableHashrate(hashrate.value)}</>
}
