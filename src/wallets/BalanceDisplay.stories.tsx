import React from 'react'
import {select} from '@storybook/addon-knobs'
import BigNumber from 'bignumber.js'
import {some} from 'fp-ts/lib/Option'
import {ether} from '../storybook-util/custom-knobs'
import {SyncStatusContent} from '../common/SyncStatus'
import {SynchronizationStatus} from '../common/store/wallet'
import {BalanceDisplay} from './BalanceDisplay'
import {ESSENTIAL_DECORATORS} from '../storybook-util/essential-decorators'

export default {
  title: 'Balance Display',
  decorators: ESSENTIAL_DECORATORS,
}

export const withZeroBalance = (): JSX.Element => (
  <BalanceDisplay availableBalance={some(new BigNumber(0))} />
)

export const interactive = (): JSX.Element => {
  return <BalanceDisplay availableBalance={some(ether('Available Balance', 15262.4578))} />
}

export const syncStatus = (): JSX.Element => {
  const statuses: Record<string, SynchronizationStatus> = {
    offline: {
      mode: 'offline',
      currentBlock: 0,
      lastNewBlockTimestamp: 0,
    },
    syncing: {
      mode: 'online',
      currentBlock: 0,
      highestKnownBlock: 0,
      pulledStates: 0,
      knownStates: 0,
      percentage: 50,
      lastNewBlockTimestamp: 0,
    },
    synced: {
      mode: 'online',
      currentBlock: 0,
      highestKnownBlock: 0,
      pulledStates: 0,
      knownStates: 0,
      percentage: 100,
      lastNewBlockTimestamp: 0,
    },
  }

  return (
    <div style={{padding: '2rem'}}>
      <SyncStatusContent
        syncStatus={statuses[select('sync status', Object.keys(statuses), 'offline')]}
      />
    </div>
  )
}
