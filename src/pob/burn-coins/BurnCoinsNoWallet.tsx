import React from 'react'
import {Dialog} from '../../common/Dialog'
import './BurnCoinsNoWallet.scss'

interface BurnCoinsNoWalletProps {
  cancel: () => void
  goToWallets: () => void
}

export const BurnCoinsNoWallet: React.FunctionComponent<BurnCoinsNoWalletProps> = ({
  cancel,
  goToWallets,
}: BurnCoinsNoWalletProps) => (
  <div className="BurnCoinsNoWallet">
    <Dialog
      title="You need an unlocked wallet to continue"
      prevButtonProps={{onClick: cancel}}
      nextButtonProps={{
        children: 'Go to Wallets',
        onClick: goToWallets,
      }}
    />
  </div>
)
