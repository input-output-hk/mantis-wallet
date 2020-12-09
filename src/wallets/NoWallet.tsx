import React, {FunctionComponent} from 'react'
import {Dialog} from '../common/Dialog'
import {RouterState} from '../router-state'
import {useTranslation} from '../settings-state'
import './NoWallet.scss'

export const NoWallet: FunctionComponent<{}> = () => {
  const routerState = RouterState.useContainer()
  const {t} = useTranslation()

  return (
    <div className="NoWallet">
      <Dialog
        title={t(['wallet', 'message', 'walletNeeded'])}
        leftButtonProps={{doNotRender: true}}
        rightButtonProps={{
          children: t(['wallet', 'button', 'goToWallets']),
          autoFocus: true,
          onClick: () => routerState.navigate('TXNS'),
        }}
      />
    </div>
  )
}
