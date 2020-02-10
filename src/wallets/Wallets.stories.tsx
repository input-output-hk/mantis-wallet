import React from 'react'
import {withKnobs, text} from '@storybook/addon-knobs'
import {BrowserRouter} from 'react-router-dom'
import {WalletListSidebar} from './WalletListSidebar'

export default {
  title: 'Wallets',
  decorators: [withKnobs],
}

export const walletList = (): JSX.Element => (
  <BrowserRouter>
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
    />
  </BrowserRouter>
)
