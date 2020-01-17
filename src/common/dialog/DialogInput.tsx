import React from 'react'
import {InputProps} from 'antd/lib/input'
import {BorderlessInput, InputErrorProps} from '../BorderlessInput'
import './DialogInput.scss'

interface DialogInputProps {
  label?: string
}

export const DialogInput: React.FunctionComponent<InputErrorProps &
  InputProps &
  DialogInputProps> = ({label, ...props}: InputErrorProps & InputProps & DialogInputProps) => (
  <div className="DialogInput">
    {label && <div className="label">{label}</div>}
    <BorderlessInput className="input" {...props} />
  </div>
)
