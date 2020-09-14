import React, {useState, FunctionComponent} from 'react'
import {text} from '@storybook/addon-knobs'
import {ESSENTIAL_DECORATORS} from '../storybook-util/essential-decorators'
import {withRouterState} from '../storybook-util/router-state-decorator'
import {withWalletState} from '../storybook-util/wallet-state-decorator'
import {withBuildJobState} from '../storybook-util/build-job-state-decorator'
import {WalletListSidebar} from './WalletListSidebar'
import {NoWallet} from './NoWallet'

export default {
  title: 'Wallets',
  decorators: [...ESSENTIAL_DECORATORS, withRouterState, withWalletState, withBuildJobState],
}

// `useState` cannot be used in stories
// https://github.com/storybookjs/storybook/issues/4691
const WalletList: FunctionComponent<{}> = () => {
  const [currentWalletId, changeWallet] = useState<string>('1')

  return (
    <WalletListSidebar
      wallets={[
        {
          id: '1',
          name: text('First wallet name', 'First wallet'),
        },
        {
          id: '2',
          name: text('Second wallet name', 'Second wallet'),
        },
        {
          id: '3',
          name: text('Third wallet name', 'Third wallet'),
        },
      ]}
      currentWalletId={currentWalletId}
      changeWallet={changeWallet}
    />
  )
}

export const walletList: FunctionComponent<{}> = () => <WalletList />

export const noWallet = (): JSX.Element => <NoWallet />
