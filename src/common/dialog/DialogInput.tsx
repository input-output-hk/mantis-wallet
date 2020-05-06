import React, {Ref, forwardRef} from 'react'
import classnames from 'classnames'
import {Input} from 'antd'
import Password from 'antd/lib/input/Password'
import {InputProps, PasswordProps} from 'antd/lib/input'
import {BorderlessInput, BorderlessInputPassword} from '../BorderlessInput'
import {InlineErrorProps} from '../InlineError'
import './DialogInput.scss'
import {DialogState} from '../Dialog'

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
> = ({label, onChange, ...props}: DialogInputProps & PasswordProps, ref: Ref<Password>) => {
  const {setErrorMessage} = DialogState.useContainer()

  const onChangeWithDialogReset = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setErrorMessage('')
    onChange?.(e)
  }

  return (
    <AbstractDialogInput label={label} id={props.id} className="DialogInputPassword">
      <BorderlessInputPassword
        className="input"
        onChange={onChangeWithDialogReset}
        {...props}
        ref={ref}
      />
    </AbstractDialogInput>
  )
}

export const DialogInputPassword = forwardRef(_DialogInputPassword)

const _DialogInput: React.RefForwardingComponent<
  Input,
  InlineErrorProps & InputProps & DialogInputProps
> = ({label, onChange, ...props}: DialogInputProps & InputProps, ref: Ref<Input>) => {
  const {setErrorMessage} = DialogState.useContainer()

  const onChangeWithDialogReset = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setErrorMessage('')
    onChange?.(e)
  }

  return (
    <AbstractDialogInput label={label} id={props.id}>
      <BorderlessInput className="input" onChange={onChangeWithDialogReset} {...props} ref={ref} />
    </AbstractDialogInput>
  )
}

export const DialogInput = forwardRef(_DialogInput)
