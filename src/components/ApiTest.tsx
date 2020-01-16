// FIXME: remove after wired up with real UI
import React from 'react'
import {wallet} from '../wallet'

export const ApiTest = (): JSX.Element => {
  const passphrase = 'Foobar12345678'

  const call = (fn: CallableFunction) => (): void => {
    fn()
      .then((result: any) => {
        console.log(result)
      })
      .catch((e: any) => {
        console.error(e)
      })
  }

  const TestButton = (props: any): any => {
    return (
      <>
        <button style={{color: 'black'}} onClick={call(props.onClick)}>
          {props.children}
        </button>
        <br />
      </>
    )
  }

  return (
    <div style={{color: 'white'}}>
      <div>
        <h1 style={{color: 'white'}}>Api Test Interface</h1>
        See results in console.
      </div>

      <div>
        {/* You can call any wallet function as usual, but the calls will be asunc */}
        <TestButton onClick={() => wallet.create({passphrase})}>Create</TestButton>
      </div>
    </div>
  )
}
