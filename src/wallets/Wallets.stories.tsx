import React, {useState} from 'react'
import {withKnobs, text} from '@storybook/addon-knobs'
import {withTheme} from '../storybook-util/theme-switcher'
import {WalletListSidebar} from './WalletListSidebar'
import {withRouterState} from '../storybook-util/router-state-decorator'
import {NoWallet} from './NoWallet'

export default {
  title: 'Wallets',
  decorators: [withRouterState, withTheme, withKnobs],
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
