import React, {Ref, forwardRef} from 'react'
import {Input} from 'antd'
import Password from 'antd/lib/input/Password'
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

const _DialogInputPassword: React.RefForwardingComponent<
  Password,
  InlineErrorProps & PasswordProps & DialogInputProps
> = ({label, ...props}: DialogInputProps, ref: Ref<Password>) => (
  <AbstractDialogInput label={label} id={props.id}>
    <BorderlessInputPassword className="input" {...props} ref={ref} />
  </AbstractDialogInput>
)

export const DialogInputPassword = forwardRef(_DialogInputPassword)

const _DialogInput: React.RefForwardingComponent<
  Input,
  InlineErrorProps & InputProps & DialogInputProps
> = ({label, ...props}: DialogInputProps, ref: Ref<Input>) => (
  <AbstractDialogInput label={label} id={props.id}>
    <BorderlessInput className="input" {...props} ref={ref} />
  </AbstractDialogInput>
)

export const DialogInput = forwardRef(_DialogInput)
