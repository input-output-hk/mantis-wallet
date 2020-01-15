import React from 'react'
import {SquareSwitch} from '../../components/SquaredSwitch'
import './WalletDialogSwitch.scss'

interface WalletDialogCheckProps {
  label: string
  description: string
  onChange: (checked: boolean) => void
  checked: boolean
}

export const WalletDialogSwitch: React.FunctionComponent<WalletDialogCheckProps> = ({
  label,
  description,
  onChange,
  checked,
}: WalletDialogCheckProps) => (
  <div className="WalletDialogSwitch">
    <div className="label">{label}</div>
    <div className="switch">
      <div>{description}</div>
      <SquareSwitch onChange={onChange} checked={checked} />
    </div>
  </div>
)
