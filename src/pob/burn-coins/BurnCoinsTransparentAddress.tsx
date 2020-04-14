import React from 'react'
import {Dialog} from '../../common/Dialog'
import './BurnCoinsTransparentAddress.scss'

interface BurnCoinsNoWalletProps {
  cancel: () => void
  generateTransparentAddress: () => Promise<void>
}

export const BurnCoinsTransparentAddress: React.FunctionComponent<BurnCoinsNoWalletProps> = ({
  cancel,
  generateTransparentAddress,
}: BurnCoinsNoWalletProps) => (
  <div className="BurnCoinsTransparentAddress">
    <Dialog
      title="You need a transparent address to continue"
      leftButtonProps={{onClick: cancel}}
      rightButtonProps={{
        children: 'Generate Transparent Address',
        autoFocus: true,
        onClick: generateTransparentAddress,
      }}
    />
  </div>
)
