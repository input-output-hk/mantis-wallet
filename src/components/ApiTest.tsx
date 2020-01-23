import React from 'react'
import {wallet} from '../wallet'

// FIXME: remove this component after every needed method is wired up with the real interface
export const ApiTest = (): JSX.Element => {
  const passphrase = 'Foobar1234'
  const spendingKey = 'm-test-shl-sk1fj335eanpmupaj9vx5879t7ljfnh7xct486rqgwxw8evwp2qkaksmcqu88'

  const call = (fn: CallableFunction) => (): void => {
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
        <TestButton onClick={(): void => wallet.create({passphrase})}>Create</TestButton>
        <TestButton onClick={(): void => wallet.remove({passphrase})}>Remove</TestButton>
        <TestButton onClick={(): void => wallet.lock({passphrase})}>Lock</TestButton>
        <TestButton onClick={(): void => wallet.unlock({passphrase})}>Unlock</TestButton>
        <TestButton onClick={(): void => wallet.generateTransparentAddress()}>
          Generate Transparent Address
        </TestButton>
        <TestButton onClick={(): void => wallet.restore({passphrase, spendingKey})}>
          Restore
        </TestButton>
      </div>
    </div>
  )
}
