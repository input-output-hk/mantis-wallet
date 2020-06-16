import React, {useState, useEffect} from 'react'
import addons, {makeDecorator, StoryContext, StoryGetter, StoryWrapper} from '@storybook/addons'
import {some} from 'fp-ts/lib/Option'
import {BackendState} from '../common/backend-state'
import {makeWeb3Worker} from '../web3'
import {mockWeb3Worker} from '../web3-mock'
import {NETWORK_SWITCHER_CHANGE} from './shared-constants'

const web3 = makeWeb3Worker(mockWeb3Worker)

const store: {
  networkTag: NetworkTag
} = {
  networkTag: 'testnet',
}

const WithBackendState: StoryWrapper = (
  storyFn: StoryGetter,
  context: StoryContext,
): JSX.Element => {
  const content = storyFn(context)
  const channel = addons.getChannel()

  const [networkTag, setNetworkTag] = useState<NetworkTag>(store.networkTag)
  const initialState = {web3, networkTag: some(networkTag)}

  const updateNetworkTag = (networkTag: NetworkTag): void => {
    setNetworkTag(networkTag)
    // eslint-disable-next-line fp/no-mutation
    store.networkTag = networkTag
  }

  useEffect(() => {
    channel.on(NETWORK_SWITCHER_CHANGE, updateNetworkTag)
    return () => channel.removeListener(NETWORK_SWITCHER_CHANGE, updateNetworkTag)
  }, [])

  return (
    <BackendState.Provider key={networkTag} initialState={initialState}>
      {content}
    </BackendState.Provider>
  )
}

export const withBackendState = makeDecorator({
  name: 'withBackendState',
  parameterName: 'withBackendState',
  wrapper: WithBackendState,
})