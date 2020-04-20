import React from 'react'
import SVG from 'react-inlinesvg'
import {DisplayChain} from '../../pob/chains'
import './DialogAddress.scss'

interface DialogAddressProps {
  chain: DisplayChain
  address: string
}

export const DialogAddress: React.FunctionComponent<DialogAddressProps> = ({
  chain,
  address,
}: DialogAddressProps) => (
  <div className="DialogAddress">
    <div className="display">
      <SVG src={chain.burnLogo} className="logo" />
      <div className="private-key">{address}</div>
    </div>
  </div>
)
