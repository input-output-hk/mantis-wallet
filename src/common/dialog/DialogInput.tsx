import React, {Ref, forwardRef} from 'react'
import classnames from 'classnames'
import {Input} from 'antd'
import Password from 'antd/lib/input/Password'
import {
  BorderlessInput,
  BorderlessInputPassword,
  BorderlessInputPasswordProps,
  BorderlessInputProps,
} from '../BorderlessInput'
import {DialogState} from '../Dialog'
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
  BorderlessInputPasswordProps & DialogInputProps
> = (
  {label, onChange, ...props}: BorderlessInputPasswordProps & DialogInputProps,
  ref: Ref<Password>,
) => {
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

const _DialogInput: React.RefForwardingComponent<Input, BorderlessInputProps & DialogInputProps> = (
  {label, onChange, ...props}: BorderlessInputProps & DialogInputProps,
  ref: Ref<Input>,
) => {
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
