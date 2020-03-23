import React, {Ref, forwardRef} from 'react'
import classnames from 'classnames'
import {Input} from 'antd'
import Password from 'antd/lib/input/Password'
import {InputProps, PasswordProps} from 'antd/lib/input'
import {BorderlessInput, BorderlessInputPassword} from '../BorderlessInput'
import {InlineErrorProps} from '../InlineError'
import './DialogInput.scss'

interface DialogInputProps {
  id?: string
  label?: string
  className?: string
}

const AbstractDialogInput: React.FunctionComponent<DialogInputProps> = ({
  children,
  label,
  id,
  className,
}: React.PropsWithChildren<DialogInputProps>) => (
  <div className={classnames('DialogInput', className)}>
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
  <AbstractDialogInput label={label} id={props.id} className="DialogInputPassword">
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
