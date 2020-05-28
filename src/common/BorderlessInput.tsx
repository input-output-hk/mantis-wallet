import React, {Ref, forwardRef} from 'react'
import {Input} from 'antd'
import Password from 'antd/lib/input/Password'
import {InputProps, PasswordProps} from 'antd/lib/input'
import {InlineError, InlineErrorProps} from './InlineError'
import './BorderlessInput.scss'

// prefix and suffix brakes BorderlessInput design, they will be disallowed
export type BorderlessInputProps = InlineErrorProps & Omit<InputProps, 'prefix' | 'suffix'>

const _BorderlessInput: React.RefForwardingComponent<Input, BorderlessInputProps> = (
  {errorMessage, forceInvalid, ...props}: BorderlessInputProps,
  ref: Ref<Input>,
) => (
  <InlineError className="BorderlessInput" errorMessage={errorMessage} forceInvalid={forceInvalid}>
    <Input {...props} ref={ref} />
  </InlineError>
)

export const BorderlessInput = forwardRef(_BorderlessInput)

export type BorderlessInputPasswordProps = InlineErrorProps &
  Omit<PasswordProps, 'prefix' | 'suffix' | 'visibilityToggle'>

const _BorderlessInputPassword: React.RefForwardingComponent<
  Password,
  BorderlessInputPasswordProps
> = ({errorMessage, forceInvalid, ...props}: BorderlessInputPasswordProps, ref: Ref<Password>) => (
  <InlineError className="BorderlessInput" errorMessage={errorMessage} forceInvalid={forceInvalid}>
    <Password visibilityToggle={false} {...props} ref={ref} />
  </InlineError>
)

export const BorderlessInputPassword = forwardRef(_BorderlessInputPassword)
