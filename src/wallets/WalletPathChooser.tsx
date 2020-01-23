import React from 'react'
import {WalletActionBox} from './WalletActionBox'
import walletIcon from '../assets/icons/wallet.svg'
import walletRestoreIcon from '../assets/icons/wallet-restore.svg'

interface WalletPathChooserProps {
  goToCreate: () => void
  goToRestore: () => void
}

export const WalletPathChooser = ({
  goToCreate,
  goToRestore,
}: WalletPathChooserProps): JSX.Element => (
  <>
    <WalletActionBox
      icon={walletIcon}
      title="Create New Wallet"
      description="Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna"
      buttonLabel="Create"
      onClick={goToCreate}
    />
    <WalletActionBox
      icon={walletRestoreIcon}
      title="Restore Wallet"
      description="Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna"
      buttonLabel="Restore"
      onClick={goToRestore}
    />
  </>
)
