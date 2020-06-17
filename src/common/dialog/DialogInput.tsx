import React, {Ref, forwardRef} from 'react'
import classnames from 'classnames'
import {Input, Form} from 'antd'
import Password from 'antd/lib/input/Password'
import {FormItemProps} from 'antd/lib/form'
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
  formItem?: Omit<FormItemProps, 'children'>
}

const AbstractDialogInput: React.FunctionComponent<DialogInputProps> = ({
  children,
  label,
  id,
  formItem,
  className,
}: React.PropsWithChildren<DialogInputProps>) => {
  return (
    <div className={classnames('DialogInput', className)}>
      {label && (
        <label className="label" htmlFor={id}>
          {label}
        </label>
      )}
      <Form.Item validateFirst {...formItem}>
        {children}
      </Form.Item>
    </div>
  )
}

const _DialogInputPassword: React.RefForwardingComponent<
  Password,
  BorderlessInputPasswordProps & DialogInputProps
> = (
  {label, onChange, formItem, ...props}: BorderlessInputPasswordProps & DialogInputProps,
  ref: Ref<Password>,
) => {
  const {setErrorMessage} = DialogState.useContainer()

  const onChangeWithDialogReset = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setErrorMessage('')
    onChange?.(e)
  }

  return (
    <AbstractDialogInput
      label={label}
      id={props.id}
      className="DialogInputPassword"
      formItem={formItem}
    >
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
  {label, onChange, formItem, ...props}: BorderlessInputProps & DialogInputProps,
  ref: Ref<Input>,
) => {
  const {setErrorMessage} = DialogState.useContainer()

  const onChangeWithDialogReset = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setErrorMessage('')
    onChange?.(e)
  }

  return (
    <AbstractDialogInput label={label} id={props.id} formItem={formItem}>
      <BorderlessInput className="input" onChange={onChangeWithDialogReset} {...props} ref={ref} />
    </AbstractDialogInput>
  )
}

export const DialogInput = forwardRef(_DialogInput)
