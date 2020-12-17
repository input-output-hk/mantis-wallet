import React from 'react'
import {makeDecorator, StoryContext, StoryGetter, StoryWrapper} from '@storybook/addons'
import {StoreWalletData, WalletState, WalletStatus} from '../common/wallet-state'
import {createInMemoryStore} from '../common/store'
import {defaultWeb3} from '../web3'

const web3 = defaultWeb3()
const store = createInMemoryStore<StoreWalletData>({
  wallet: {
    txHistory: {},
    addressBook: {
      '0x3b20f0bcc64671d8d758f3469ec5ce4c8484a872': 'My Address',
      '0xffffffffffffffffffffffffffffffffffffffff': 'Frank Foo',
    },
    accounts: [
      {
        name: 'ww',
        address: '0x3b20f0bcc64671d8d758f3469ec5ce4c8484a872',
        keystore: {
          version: 3,
          id: '7626fbb5-d4f9-4ab1-b42e-a6d634e24e09',
          address: '3b20f0bcc64671d8d758f3469ec5ce4c8484a872',
          crypto: {
            ciphertext: '8d76734be4f25eb9570cf75add50eebae49697298acf4c0a020a6f843a82a48a',
            cipherparams: {
              iv: 'b5be4cd1fae5cb69229371f0b078110b',
            },
            cipher: 'aes-128-ctr',
            kdf: 'scrypt',
            kdfparams: {
              dklen: 32,
              salt: '402a8715edf86d56d4d8ad9bc84a05a74b33103bb2ba3d1b78b7b946188d13df',
              n: 8192,
              r: 8,
              p: 1,
            },
            mac: '84401041ee13b931cfeccbc38c9bed3d71247727c43873975c5ade8df8f85cb3',
          },
        },
      },
    ],
    tncAccepted: false,
  },
})

const WithWalletState: StoryWrapper = (
  storyFn: StoryGetter,
  context: StoryContext,
  {parameters},
): JSX.Element => {
  const content = storyFn(context)
  const initialState = {
    walletStatus: 'LOADED' as WalletStatus,
    web3,
    store,
    isMocked: true,
    ...parameters,
  }

  return <WalletState.Provider initialState={initialState}>{content}</WalletState.Provider>
}

export const withWalletState = makeDecorator({
  name: 'withWalletState',
  parameterName: 'withWalletState',
  wrapper: WithWalletState,
})
