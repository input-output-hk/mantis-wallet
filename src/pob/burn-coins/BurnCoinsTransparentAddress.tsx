import React, {FunctionComponent} from 'react'
import {Dialog} from '../../common/Dialog'
import {useTranslation} from '../../settings-state'
import './BurnCoinsTransparentAddress.scss'

interface BurnCoinsNoWalletProps {
  cancel: () => void
  generateTransparentAccount: () => Promise<void>
}

export const BurnCoinsTransparentAddress: FunctionComponent<BurnCoinsNoWalletProps> = ({
  cancel,
  generateTransparentAccount,
}: BurnCoinsNoWalletProps) => {
  const {t} = useTranslation()
  return (
    <div className="BurnCoinsTransparentAddress">
      <Dialog
        title={t(['wallet', 'message', 'transparentAddressNeeded'])}
        leftButtonProps={{onClick: cancel}}
        rightButtonProps={{
          children: t(['wallet', 'button', 'generateTransparentAccount']),
          autoFocus: true,
          onClick: generateTransparentAccount,
        }}
      />
    </div>
  )
}
