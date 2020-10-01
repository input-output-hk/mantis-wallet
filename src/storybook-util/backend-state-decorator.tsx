import React, {useState, useEffect} from 'react'
import addons, {makeDecorator, StoryContext, StoryGetter, StoryWrapper} from '@storybook/addons'
import {some} from 'fp-ts/lib/Option'
import Web3 from 'web3'
import {BackendState} from '../common/backend-state'
import {NETWORK_SWITCHER_CHANGE} from './shared-constants'

const store: {
  networkType: string
} = {
  networkType: 'private',
}

const WithBackendState: StoryWrapper = (
  storyFn: StoryGetter,
  context: StoryContext,
): JSX.Element => {
  const content = storyFn(context)
  const channel = addons.getChannel()

  const [networkType, setNetworkType] = useState<string>(store.networkType)
  const initialState = {web3: new Web3(), networkType: some(networkType)}

  const updateNetworkType = (networkType: string): void => {
    setNetworkType(networkType)
    // eslint-disable-next-line fp/no-mutation
    store.networkType = networkType
  }

  useEffect(() => {
    channel.on(NETWORK_SWITCHER_CHANGE, updateNetworkType)
    return () => channel.removeListener(NETWORK_SWITCHER_CHANGE, updateNetworkType)
  }, [])

  return (
    <BackendState.Provider key={networkType} initialState={initialState}>
      {content}
    </BackendState.Provider>
  )
}

export const withBackendState = makeDecorator({
  name: 'withBackendState',
  parameterName: 'withBackendState',
  wrapper: WithBackendState,
})
