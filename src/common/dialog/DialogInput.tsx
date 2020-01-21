import React from 'react'
import {InputProps} from 'antd/lib/input'
import {BorderlessInput} from '../BorderlessInput'
import {InlineErrorProps} from '../InlineError'
import './DialogInput.scss'

interface DialogInputProps {
  label?: string
}

export const DialogInput: React.FunctionComponent<InlineErrorProps &
  InputProps &
  DialogInputProps> = ({label, ...props}: InlineErrorProps & InputProps & DialogInputProps) => (
  <div className="DialogInput">
    {label && <div className="label">{label}</div>}
    <BorderlessInput className="input" {...props} />
  </div>
)
