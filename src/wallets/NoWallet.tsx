import React from 'react'
import {Dialog} from '../common/Dialog'
import {RouterState} from '../router-state'
import './NoWallet.scss'

export const NoWallet: React.FunctionComponent<{}> = () => {
  const routerState = RouterState.useContainer()

  return (
    <div className="NoWallet">
      <Dialog
        title="You need an unlocked wallet to continue"
        buttonDisplayMode="natural"
        leftButtonProps={{doNotRender: true}}
        rightButtonProps={{
          children: 'Go to Wallets',
          autoFocus: true,
          onClick: () => routerState.navigate('WALLETS'),
        }}
      />
    </div>
  )
}
