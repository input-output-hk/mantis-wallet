import React from 'react'
import {WalletActionBox} from './WalletActionBox'

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
      icon="/icons/wallet.svg"
      title="Create New Wallet"
      description="Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna"
      buttonLabel="Create"
      onClick={goToCreate}
    />
    <WalletActionBox
      icon="/icons/wallet-restore.svg"
      title="Restore Wallet"
      description="Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna"
      buttonLabel="Restore"
      onClick={goToRestore}
    />
  </>
)
