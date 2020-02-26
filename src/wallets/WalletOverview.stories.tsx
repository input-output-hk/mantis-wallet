import React from 'react'
import {withKnobs, number, select} from '@storybook/addon-knobs'
import BigNumber from 'bignumber.js'
import {withTheme} from '../storybook-util/theme-switcher'
import {withWalletState} from '../storybook-util/wallet-state-decorator'
import {toWei} from 'web3/lib/utils/utils.js'
import {SynchronizationStatus} from '../web3'
import {SyncStatusContent} from '../common/SyncStatus'
import {WalletOverview} from './WalletOverview'
import './WalletOverview.scss'

export default {
  title: 'Wallet Overview',
  decorators: [withWalletState, withTheme, withKnobs],
}

export const withZeroBalance = (): JSX.Element => (
  <WalletOverview
    pending={new BigNumber(0)}
    transparent={new BigNumber(0)}
    confidential={new BigNumber(0)}
  />
)

export const interactive = (): JSX.Element => {
  return (
    <WalletOverview
      confidential={toWei(new BigNumber(number('Confidential', 15262.4578)))}
      transparent={toWei(new BigNumber(number('Transparent', 6359.36)))}
      pending={toWei(new BigNumber(number('Pending', 3815.62)))}
    />
  )
}

export const syncStatus = (): JSX.Element => {
  const statuses: Record<string, SynchronizationStatus> = {
    offline: {
      mode: 'offline',
      currentBlock: '0x0',
    },
    syncing: {
      mode: 'online',
      currentBlock: '0x0',
      highestKnownBlock: '0x0',
      percentage: 50,
    },
    synced: {
      mode: 'online',
      currentBlock: '0x0',
      highestKnownBlock: '0x0',
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
