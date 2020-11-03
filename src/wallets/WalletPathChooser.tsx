import React from 'react'
import {WalletActionBox} from './WalletActionBox'
import {useTranslation} from '../settings-state'
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
}: WalletPathChooserProps): JSX.Element => {
  const {t} = useTranslation()

  return (
    <div className="WalletPathChooser">
      <div className="column">
        <WalletActionBox
          icon={walletIcon}
          title={t(['wallet', 'title', 'createNewWallet'])}
          description={t(['wallet', 'message', 'createNewWalletDescription'])}
          buttonLabel={t(['wallet', 'button', 'createWallet'])}
          onClick={goToCreate}
        />
      </div>
      <div className="column">
        <WalletActionBox
          icon={walletRestoreIcon}
          title={t(['wallet', 'title', 'restoreWallet'])}
          description={t(['wallet', 'message', 'restoreWalletDescription'])}
          buttonLabel={t(['wallet', 'button', 'restoreWallet'])}
          onClick={goToRestore}
        />
      </div>
    </div>
  )
}
