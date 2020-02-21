import React, {useState} from 'react'
import {Dialog} from '../../common/Dialog'
import {Chain} from '../chains'
import {DialogAddress} from '../../common/dialog/DialogAddress'
import {DialogApproval} from '../../common/dialog/DialogApproval'
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
  const [approval, setApproval] = useState(false)

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
        <DialogApproval
          checked={approval}
          onChange={setApproval}
          description={
            <>
              This is a Bitcoin Address to which you can send Bitcoin to be burned and converted
              into Midnight Tokens. these Midnight Tokens can be used to participate in an Auction
              to win spendable Dust Tokens. The Burn process is irreversible and the Bitcoin burned
              will be unspendable forever.
              <br />
              <br />I understand the process
            </>
          }
        />
      </Dialog>
    </div>
  )
}
