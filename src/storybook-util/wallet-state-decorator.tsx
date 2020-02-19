import React from 'react'
import {makeDecorator, StoryContext, StoryGetter} from '@storybook/addons'
import {WalletState} from '../common/wallet-state'

const WithWalletState = (storyFn: StoryGetter, context: StoryContext): JSX.Element => {
  const content = storyFn(context)
  return <WalletState.Provider>{content}</WalletState.Provider>
}

export const withWalletState = makeDecorator({
  name: 'withWalletState',
  parameterName: 'walletState',
  wrapper: WithWalletState,
})
