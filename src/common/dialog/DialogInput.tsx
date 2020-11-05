import React, {
  Ref,
  forwardRef,
  FunctionComponent,
  PropsWithChildren,
  RefForwardingComponent,
  ReactNode,
} from 'react'
import classnames from 'classnames'
import {Input, Form} from 'antd'
import Password from 'antd/lib/input/Password'
import TextArea from 'antd/lib/input/TextArea'
import {FormItemProps} from 'antd/lib/form'
import {
  BorderlessInput,
  BorderlessInputPassword,
  BorderlessInputPasswordProps,
  BorderlessInputProps,
  BorderlessTextArea,
  BorderlessTextAreaProps,
} from '../BorderlessInput'
import {DialogState} from '../Dialog'
import {Trans} from '../Trans'
import './DialogInput.scss'

interface DialogInputProps {
  id?: string
  label?: ReactNode
  className?: string
  optional?: boolean
  formItem?: Omit<FormItemProps, 'children'>
}

const AbstractDialogInput: FunctionComponent<DialogInputProps> = ({
  children,
  label,
  id,
  formItem,
  optional,
  className,
}: PropsWithChildren<DialogInputProps>) => {
  return (
    <div className={classnames('DialogInput', className)}>
      {(label || optional) && (
        <label className="label" htmlFor={id}>
          {label}{' '}
          {optional && (
            <span className="optional">
              (<Trans k={['common', 'label', 'optionalField']} />)
            </span>
          )}
        </label>
      )}
      <Form.Item validateFirst {...formItem}>
        {children}
      </Form.Item>
    </div>
  )
}

const _DialogInputPassword: RefForwardingComponent<
  Password,
  BorderlessInputPasswordProps & DialogInputProps
> = (
  {label, onChange, formItem, optional, ...props}: BorderlessInputPasswordProps & DialogInputProps,
  ref: Ref<Password>,
) => {
  const {setErrorMessage} = DialogState.useContainer()

  const onChangeWithDialogReset = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setErrorMessage('')
    onChange?.(e)
  }

  return (
    <AbstractDialogInput label={label} id={props.id} formItem={formItem} optional={optional}>
      <BorderlessInputPassword
        className="input"
        onChange={onChangeWithDialogReset}
        {...props}
        ref={ref}
      />
    </AbstractDialogInput>
  )
}

const _DialogInput: RefForwardingComponent<Input, BorderlessInputProps & DialogInputProps> = (
  {label, onChange, formItem, optional, ...props}: BorderlessInputProps & DialogInputProps,
  ref: Ref<Input>,
) => {
  const {setErrorMessage} = DialogState.useContainer()

  const onChangeWithDialogReset = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setErrorMessage('')
    onChange?.(e)
  }

  return (
    <AbstractDialogInput label={label} id={props.id} formItem={formItem} optional={optional}>
      <BorderlessInput className="input" onChange={onChangeWithDialogReset} {...props} ref={ref} />
    </AbstractDialogInput>
  )
}

const _DialogTextArea: RefForwardingComponent<
  TextArea,
  BorderlessTextAreaProps & DialogInputProps
> = (
  {label, onChange, formItem, optional, ...props}: BorderlessTextAreaProps & DialogInputProps,
  ref: Ref<TextArea>,
) => {
  const {setErrorMessage} = DialogState.useContainer()

  const onChangeWithDialogReset = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setErrorMessage('')
    onChange?.(e)
  }

  return (
    <AbstractDialogInput label={label} id={props.id} formItem={formItem} optional={optional}>
      <BorderlessTextArea
        className="input"
        onChange={onChangeWithDialogReset}
        {...props}
        ref={ref}
      />
    </AbstractDialogInput>
  )
}

export const DialogInputPassword = forwardRef(_DialogInputPassword)
export const DialogInput = forwardRef(_DialogInput)
export const DialogTextArea = forwardRef(_DialogTextArea)
