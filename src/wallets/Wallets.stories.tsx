import React, {useState} from 'react'
import {withKnobs, text} from '@storybook/addon-knobs'
import {action} from '@storybook/addon-actions'
import {withTheme} from '../storybook-util/theme-switcher'
import {withRouterState} from '../storybook-util/router-state-decorator'
import {withWalletState} from '../storybook-util/wallet-state-decorator'
import {dust, asyncAction} from '../storybook-util/custom-knobs'
import {dummyTransactions} from '../storybook-util/dummies'
import {WalletListSidebar} from './WalletListSidebar'
import {TransparentAccounts} from './TransparentAccounts'
import {NoWallet} from './NoWallet'

export default {
  title: 'Wallets',
  decorators: [withRouterState, withWalletState, withTheme, withKnobs],
}

// `useState` cannot be used in stories
// https://github.com/storybookjs/storybook/issues/4691
const WalletList: React.FunctionComponent<{}> = () => {
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

export const walletList: React.FunctionComponent<{}> = () => <WalletList />

export const noWallet = (): JSX.Element => <NoWallet />

export const noTransparentAccounts = (): JSX.Element => (
  <TransparentAccounts
    generateAddress={action('generate-address')}
    transparentAccounts={[]}
    redeem={asyncAction('on-redeem')}
    backToTransactions={action('back-to-transactions')}
    transactions={[]}
  />
)

export const transparentAccounts = (): JSX.Element => (
  <TransparentAccounts
    generateAddress={action('generate-address')}
    transparentAccounts={[
      {
        address: 'third-transparent-address',
        index: 2,
        balance: dust('Third account balance', 0),
      },
      {
        address: 'second-transparent-address',
        index: 1,
        balance: dust('Second account balance', 0),
      },
      {
        address: 'first-transparent-address',
        index: 0,
        balance: dust('First account balance', 1234),
      },
    ]}
    redeem={asyncAction('on-redeem')}
    backToTransactions={action('back-to-transactions')}
    transactions={dummyTransactions}
  />
)
