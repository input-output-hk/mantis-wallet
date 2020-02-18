import React from 'react'
import {InputProps, PasswordProps} from 'antd/lib/input'
import {BorderlessInput, BorderlessInputPassword} from '../BorderlessInput'
import {InlineErrorProps} from '../InlineError'
import './DialogInput.scss'

interface DialogInputProps {
  id?: string
  label?: string
}

const AbstractDialogInput: React.FunctionComponent<DialogInputProps> = ({
  children,
  label,
  id,
}: React.PropsWithChildren<DialogInputProps>) => (
  <div className="DialogInput">
    {label && (
      <label className="label" htmlFor={id}>
        {label}
      </label>
    )}
    {children}
  </div>
)

export const DialogInputPassword: React.FunctionComponent<InlineErrorProps &
  PasswordProps &
  DialogInputProps> = ({label, ...props}: DialogInputProps) => (
  <AbstractDialogInput label={label} id={props.id}>
    <BorderlessInputPassword className="input" {...props} />
  </AbstractDialogInput>
)

export const DialogInput: React.FunctionComponent<InlineErrorProps &
  InputProps &
  DialogInputProps> = ({label, ...props}: DialogInputProps) => (
  <AbstractDialogInput label={label} id={props.id}>
    <BorderlessInput className="input" {...props} />
  </AbstractDialogInput>
)
