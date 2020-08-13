import React, {FunctionComponent} from 'react'
import {Dialog} from '../../common/Dialog'
import {PobChain} from '../pob-chains'
import {DialogAddress} from '../../common/dialog/DialogAddress'
import {useLocalizedUtilities, useTranslation} from '../../settings-state'
import './BurnCoinsShowAddress.scss'

interface BurnCoinsShowAddressProps {
  chain: PobChain
  burnAddress: string
  goBack: () => void
}

export const BurnCoinsShowAddress: FunctionComponent<BurnCoinsShowAddressProps> = ({
  chain,
  burnAddress,
  goBack: cancel,
}: BurnCoinsShowAddressProps) => {
  const {copyToClipboard} = useLocalizedUtilities()
  const {t} = useTranslation()

  return (
    <div className="BurnCoinsShowAddress">
      <Dialog
        title={t(chain.translations.burnAddress)}
        leftButtonProps={{
          children: t(['proofOfBurn', 'button', 'goBackToBurnCentre']),
          onClick: cancel,
        }}
        rightButtonProps={{
          children: t(['proofOfBurn', 'button', 'copyAddress']),
          autoFocus: true,
          onClick: async () => await copyToClipboard(burnAddress),
        }}
      >
        <DialogAddress svgLogo={chain.burnLogo} address={burnAddress} />
      </Dialog>
    </div>
  )
}
