import React from 'react'
import {Dialog} from '../../common/Dialog'
import {Chain} from '../chains'
import {DialogAddress} from '../../common/dialog/DialogAddress'
import {copyToClipboard} from '../../common/clipboard'
import './BurnCoinsShowAddress.scss'

interface BurnCoinsShowAddressProps {
  chain: Chain
  burnAddress: string
  goBack: () => void
}

export const BurnCoinsShowAddress: React.FunctionComponent<BurnCoinsShowAddressProps> = ({
  chain,
  burnAddress,
  goBack: cancel,
}: BurnCoinsShowAddressProps) => {
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
        <DialogAddress chain={chain} address={burnAddress} />
      </Dialog>
    </div>
  )
}
