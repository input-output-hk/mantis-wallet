import React, {FunctionComponent} from 'react'
import {Dialog} from '../../common/Dialog'
import {PobChain} from '../pob-chains'
import {DialogAddress} from '../../common/dialog/DialogAddress'
import {useLocalizedUtilities} from '../../settings-state'
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

  return (
    <div className="BurnCoinsShowAddress">
      <Dialog
        title={`${chain.name} Burn Address`}
        leftButtonProps={{
          children: '← Go Back to Burn Centre',
          onClick: cancel,
        }}
        rightButtonProps={{
          children: 'Copy Address',
          autoFocus: true,
          onClick: () => copyToClipboard(burnAddress),
        }}
      >
        <DialogAddress svgLogo={chain.burnLogo} address={burnAddress} />
      </Dialog>
    </div>
  )
}
