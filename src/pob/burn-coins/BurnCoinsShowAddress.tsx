import React from 'react'
import {Dialog} from '../../common/Dialog'
import {Chain} from '../chains'
import {DialogAddress} from '../../common/dialog/DialogAddress'
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
        prevButtonProps={{
          children: '← Go Back',
          onClick: cancel,
        }}
        nextButtonProps={{
          children: 'Copy Code',
          onClick: () => navigator.clipboard.writeText(burnAddress),
        }}
      >
        <DialogAddress chain={chain} address={burnAddress} />
      </Dialog>
    </div>
  )
}
