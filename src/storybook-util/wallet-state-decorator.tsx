import React from 'react'
import {makeDecorator, StoryContext, StoryGetter, StoryWrapper} from '@storybook/addons'
import {WalletState, WalletStatus} from '../common/wallet-state'
import {makeWeb3Worker} from '../web3'
import {mockWeb3Worker} from '../web3-mock'

const web3 = makeWeb3Worker(mockWeb3Worker)

const WithWalletState: StoryWrapper = (
  storyFn: StoryGetter,
  context: StoryContext,
  {parameters},
): JSX.Element => {
  const content = storyFn(context)
  const initialState = {walletStatus: 'LOADED' as WalletStatus, web3, ...parameters}

  return <WalletState.Provider initialState={initialState}>{content}</WalletState.Provider>
}

export const withWalletState = makeDecorator({
  name: 'withWalletState',
  parameterName: 'withWalletState',
  wrapper: WithWalletState,
})
