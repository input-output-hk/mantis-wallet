import React, {FunctionComponent} from 'react'
import Switch, {SwitchProps} from 'antd/lib/switch'
import './DialogSwitch.scss'

interface DialogCheckProps {
  label: string
  description: string
}

export const DialogSwitch: FunctionComponent<DialogCheckProps & SwitchProps> = ({
  label,
  description,
  ...rest
}: DialogCheckProps & SwitchProps) => (
  <div className="DialogSwitch">
    <div className="label">{label}</div>
    <div className="switch">
      <div>{description}</div>
      <Switch title={label} {...rest} />
    </div>
  </div>
)
