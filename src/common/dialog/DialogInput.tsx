import React from 'react'
import {InputProps} from 'antd/lib/input'
import {BorderlessInput} from '../BorderlessInput'
import './DialogInput.scss'

interface DialogInputProps {
  label: string
}

export const DialogInput: React.FunctionComponent<InputProps & DialogInputProps> = ({
  label,
  ...props
}: InputProps & DialogInputProps) => (
  <div className="DialogInput">
    <div className="label">{label}</div>
    <BorderlessInput className="input" {...props} />
  </div>
)
