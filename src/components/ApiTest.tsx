import React from 'react'
import {wallet} from '../wallet'
import {SpendingKey, SeedPhrase, TransparentAddress, Account} from '../web3'
import {WalletState} from '../common/wallet-state'

// FIXME: remove this component after every needed method is wired up with the real interface
export const ApiTest = (): JSX.Element => {
  const state = WalletState.useContainer()
  const passphrase = 'Foobar1234'
  const spendingKey = 'm-test-shl-sk1fj335eanpmupaj9vx5879t7ljfnh7xct486rqgwxw8evwp2qkaksmcqu88'

  const call = (fn: CallableFunction) => (): void => {
    if (state.walletStatus === 'LOADED') state.reset()
    fn()
      .then((result: unknown) => console.log(result))
      .catch((e: Error) => console.error(e.message))
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const TestButton = (props: any): JSX.Element => {
    return (
      <button style={{color: 'black', display: 'block'}} onClick={call(props.onClick)}>
        {props.children}
      </button>
    )
  }

  return (
    <div style={{color: 'white'}}>
      <div>
        <h1 style={{color: 'white'}}>Api Test Interface</h1>
        See results in console.
      </div>

      <div>
        {/* You can call any wallet function as usual, but the calls will be async */}
        <TestButton onClick={(): Promise<SpendingKey & SeedPhrase> => wallet.create({passphrase})}>
          Create
        </TestButton>
        <TestButton onClick={(): Promise<boolean> => wallet.remove({passphrase})}>
          Remove
        </TestButton>
        <TestButton onClick={(): Promise<boolean> => wallet.lock({passphrase})}>Lock</TestButton>
        <TestButton onClick={(): Promise<boolean> => wallet.unlock({passphrase})}>
          Unlock
        </TestButton>
        <TestButton
          onClick={(): Promise<TransparentAddress> => wallet.generateTransparentAddress()}
        >
          Generate Transparent Address
        </TestButton>
        <TestButton onClick={(): Promise<boolean> => wallet.restore({passphrase, spendingKey})}>
          Restore
        </TestButton>
        <TestButton onClick={(): Promise<Account[]> => wallet.listAccounts()}>Accounts</TestButton>
      </div>
    </div>
  )
}
