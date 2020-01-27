import React from 'react'
import {SquareSwitch} from '../SquaredSwitch'
import './DialogSwitch.scss'

interface DialogCheckProps {
  label: string
  description: string
  onChange: (checked: boolean) => void
  checked: boolean
}

export const DialogSwitch: React.FunctionComponent<DialogCheckProps> = ({
  label,
  description,
  onChange,
  checked,
}: DialogCheckProps) => (
  <div className="DialogSwitch">
    <div className="label">{label}</div>
    <div className="switch">
      <div>{description}</div>
      <SquareSwitch title={label} onChange={onChange} checked={checked} />
    </div>
  </div>
)
