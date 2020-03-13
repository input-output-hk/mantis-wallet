import React from 'react'
import {WalletActionBox} from './WalletActionBox'
import walletIcon from '../assets/icons/wallet.svg'
import walletRestoreIcon from '../assets/icons/wallet-restore.svg'
import './WalletPathChooser.scss'

interface WalletPathChooserProps {
  goToCreate: () => void
  goToRestore: () => void
}

export const WalletPathChooser = ({
  goToCreate,
  goToRestore,
}: WalletPathChooserProps): JSX.Element => (
  <div className="WalletPathChooser">
    <div className="column">
      <WalletActionBox
        icon={walletIcon}
        title="Create New Wallet"
        description="Create a New Wallet"
        buttonLabel="Create"
        onClick={goToCreate}
      />
    </div>
    <div className="column">
      <WalletActionBox
        icon={walletRestoreIcon}
        title="Restore Wallet"
        description={'Restore wallet using Backup\u00a0Recovery\u00a0Phrase or Private\u00a0Key'}
        buttonLabel="Restore"
        onClick={goToRestore}
      />
    </div>
  </div>
)
