import React from 'react'
import {SwitchProps} from 'antd/lib/switch'
import {SquareSwitch} from '../SquaredSwitch'
import './DialogSwitch.scss'

interface DialogCheckProps {
  label: string
  description: string
}

export const DialogSwitch: React.FunctionComponent<DialogCheckProps & SwitchProps> = ({
  label,
  description,
  ...rest
}: DialogCheckProps & SwitchProps) => (
  <div className="DialogSwitch">
    <div className="label">{label}</div>
    <div className="switch">
      <div>{description}</div>
      <SquareSwitch title={label} {...rest} />
    </div>
  </div>
)
