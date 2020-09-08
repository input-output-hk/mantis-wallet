import React, {useState, FunctionComponent} from 'react'
import {text} from '@storybook/addon-knobs'
import {action} from '@storybook/addon-actions'
import {ESSENTIAL_DECORATORS} from '../storybook-util/essential-decorators'
import {withRouterState} from '../storybook-util/router-state-decorator'
import {withWalletState} from '../storybook-util/wallet-state-decorator'
import {withBuildJobState} from '../storybook-util/build-job-state-decorator'
import {dust, asyncAction} from '../storybook-util/custom-knobs'
import {dummyTransactions, estimateFeesWithRandomDelay} from '../storybook-util/dummies'
import {WalletListSidebar} from './WalletListSidebar'
import {TransparentAccounts} from './TransparentAccounts'
import {NoWallet} from './NoWallet'
import {RedeemModal} from './modals/RedeemModal'

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

export const noTransparentAccounts = (): JSX.Element => (
  <TransparentAccounts
    generateAddress={action('generate-address')}
    transparentAccounts={[]}
    redeem={asyncAction('on-redeem')}
    estimateRedeemFee={estimateFeesWithRandomDelay}
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
        tokens: {},
      },
      {
        address: 'second-transparent-address',
        index: 1,
        balance: dust('Second account balance', 0),
        tokens: {},
      },
      {
        address: 'first-transparent-address',
        index: 0,
        balance: dust('First account balance', 1234),
        tokens: {},
      },
    ]}
    redeem={asyncAction('on-redeem')}
    estimateRedeemFee={estimateFeesWithRandomDelay}
    backToTransactions={action('back-to-transactions')}
    transactions={dummyTransactions}
  />
)

export const redeemModal = (): JSX.Element => (
  <RedeemModal
    redeem={asyncAction('on-redeem')}
    estimateRedeemFee={estimateFeesWithRandomDelay}
    transparentAccount={{
      address: 'transparent-address',
      index: 1,
      balance: dust('Account balance', 1234),
      tokens: {},
    }}
    onCancel={action('on-cancel')}
    visible
  />
)
