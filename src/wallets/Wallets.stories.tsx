import React, {useState} from 'react'
import {withKnobs, text} from '@storybook/addon-knobs'
import {action} from '@storybook/addon-actions'
import {withTheme} from '../storybook-util/theme-switcher'
import {WalletListSidebar} from './WalletListSidebar'
import {withRouterState} from '../storybook-util/router-state-decorator'
import {NoWallet} from './NoWallet'
import {TransparentAccounts} from './TransparentAccounts'
import {dust, asyncAction} from '../storybook-util/custom-knobs'
import {Transaction} from '../web3'

export default {
  title: 'Wallets',
  decorators: [withRouterState, withTheme, withKnobs],
}

const dummyTransactions: Transaction[] = [
  {
    hash: '1',
    txStatus: 'pending',
    txDetails: {
      txType: 'transfer',
    },
    txDirection: 'outgoing',
    txValue: {
      value: '0x2cc4d20.03384f2',
      fee: '0x1708f6e.516b101',
    },
  },
  {
    hash: '2',
    txStatus: 'pending',
    txDetails: {
      txType: 'transfer',
    },
    txDirection: 'outgoing',
    txValue: {
      value: '0x4f5ab6c.5fa3978',
      fee: '0x4f35875.dfb4d8',
    },
  },
  {
    hash: '3',
    txStatus: {
      status: 'confirmed',
      atBlock: '0x190a5da',
      timestamp: 1585550563,
    },
    txDetails: {
      txType: 'transfer',
    },
    txDirection: 'incoming',
    txValue: '0x100441e.28eea7e',
  },
  {
    hash: '4',
    txStatus: 'pending',
    txDetails: {
      txType: 'transfer',
    },
    txDirection: 'incoming',
    txValue: '0x54708b.9c39d60c',
  },
  {
    hash: '5',
    txStatus: {
      status: 'confirmed',
      atBlock: '0x2545dbb',
      timestamp: 1585294963,
    },
    txDetails: {
      txType: 'transfer',
    },
    txDirection: 'outgoing',
    txValue: {
      value: '0x1cbb3d6.1494927',
      fee: '0x221f4c2.94e79a6',
    },
  },
  {
    hash: '6',
    txStatus: {
      status: 'confirmed',
      atBlock: '0xb70ef5',
      timestamp: 1585122163,
    },
    txDetails: {
      txType: 'transfer',
    },
    txDirection: 'incoming',
    txValue: '0x113a306.f156b0e',
  },
  {
    hash: '7',
    txStatus: 'pending',
    txDetails: {
      txType: 'transfer',
    },
    txDirection: 'incoming',
    txValue: '0x4c45dce.3ca6d58',
  },
  {
    hash: '8',
    txStatus: 'pending',
    txDetails: {
      txType: 'transfer',
    },
    txDirection: 'outgoing',
    txValue: {
      value: '0x20ea438.060343e',
      fee: '0x53bcf60.d812144',
    },
  },
  {
    hash: '9',
    txStatus: {
      status: 'confirmed',
      atBlock: '0x95c3c2',
      timestamp: 1585118563,
    },
    txDetails: {
      txType: 'transfer',
    },
    txDirection: 'incoming',
    txValue: '0xaeccfd.332a645',
  },
]

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
        address: 'first-transparent-address',
        index: 1,
        balance: dust('First account balance', 1234),
      },
      {
        address: 'second-transparent-address',
        index: 2,
        balance: dust('Second account balance', 0),
      },
    ]}
    redeem={asyncAction('on-redeem')}
    backToTransactions={action('back-to-transactions')}
    transactions={dummyTransactions}
  />
)
