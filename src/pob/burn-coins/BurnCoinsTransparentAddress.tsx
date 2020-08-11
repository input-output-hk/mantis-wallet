import React, {FunctionComponent} from 'react'
import {Dialog} from '../../common/Dialog'
import {useTranslation} from '../../settings-state'
import './BurnCoinsTransparentAddress.scss'

interface BurnCoinsNoWalletProps {
  cancel: () => void
  generateTransparentAddress: () => Promise<void>
}

export const BurnCoinsTransparentAddress: FunctionComponent<BurnCoinsNoWalletProps> = ({
  cancel,
  generateTransparentAddress,
}: BurnCoinsNoWalletProps) => {
  const {t} = useTranslation()
  return (
    <div className="BurnCoinsTransparentAddress">
      <Dialog
        title={t(['wallet', 'message', 'transparentAddressNeeded'])}
        leftButtonProps={{onClick: cancel}}
        rightButtonProps={{
          children: t(['wallet', 'button', 'generateTransparentAddress']),
          autoFocus: true,
          onClick: generateTransparentAddress,
        }}
      />
    </div>
  )
}
