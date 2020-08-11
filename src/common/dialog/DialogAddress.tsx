import React, {FunctionComponent} from 'react'
import SVG from 'react-inlinesvg'
import './DialogAddress.scss'

interface DialogAddressProps {
  svgLogo: string
  address: string
}

export const DialogAddress: FunctionComponent<DialogAddressProps> = ({
  svgLogo,
  address,
}: DialogAddressProps) => (
  <div className="DialogAddress">
    <div className="display">
      <SVG src={svgLogo} className="logo" />
      <div className="private-key">{address}</div>
    </div>
  </div>
)
