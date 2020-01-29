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
    {label && (
      <label className="label" htmlFor={props.id}>
        {label}
      </label>
    )}
    <BorderlessInput className="input" {...props} />
  </div>
)
