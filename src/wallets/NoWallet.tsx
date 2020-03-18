import React from 'react'
import {Dialog} from '../common/Dialog'
import {RouterState} from '../router-state'

export const NoWallet: React.FunctionComponent<{}> = () => {
  const routerState = RouterState.useContainer()

  return (
    <div className="NoWallet">
      <Dialog
        title="You need an unlocked wallet to continue"
        rightButtonProps={{
          children: 'Go to Wallets',
          onClick: () => routerState.navigate('WALLETS'),
        }}
      />
    </div>
  )
}
