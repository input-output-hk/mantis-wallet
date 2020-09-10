import React from 'react'
import {select} from '@storybook/addon-knobs'
import BigNumber from 'bignumber.js'
import {ether} from '../storybook-util/custom-knobs'
import {withWalletState} from '../storybook-util/wallet-state-decorator'
import {withBuildJobState} from '../storybook-util/build-job-state-decorator'
import {SyncStatusContent} from '../common/SyncStatus'
import {SynchronizationStatus} from '../common/wallet-state'
import {WalletOverview} from './WalletOverview'
import {ESSENTIAL_DECORATORS} from '../storybook-util/essential-decorators'

export default {
  title: 'Wallet Overview',
  decorators: [...ESSENTIAL_DECORATORS, withWalletState, withBuildJobState],
}

export const withZeroBalance = (): JSX.Element => (
  <WalletOverview availableBalance={new BigNumber(0)} />
)

export const interactive = (): JSX.Element => {
  return <WalletOverview availableBalance={ether('Available Balance', 15262.4578)} />
}

export const syncStatus = (): JSX.Element => {
  const statuses: Record<string, SynchronizationStatus> = {
    offline: {
      mode: 'offline',
      currentBlock: 0,
    },
    syncing: {
      mode: 'online',
      currentBlock: 0,
      highestKnownBlock: 0,
      percentage: 50,
    },
    synced: {
      mode: 'online',
      currentBlock: 0,
      highestKnownBlock: 0,
      percentage: 100,
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
