import React, {Ref, forwardRef} from 'react'
import {Input} from 'antd'
import Password from 'antd/lib/input/Password'
import {InputProps, PasswordProps} from 'antd/lib/input'
import {InlineError, InlineErrorProps} from './InlineError'
import './BorderlessInput.scss'

const _BorderlessInput: React.RefForwardingComponent<Input, InlineErrorProps & InputProps> = (
  {errorMessage, forceInvalid, ...props}: InlineErrorProps & InputProps,
  ref: Ref<Input>,
) => (
  <InlineError className="BorderlessInput" errorMessage={errorMessage} forceInvalid={forceInvalid}>
    <Input {...props} ref={ref} />
  </InlineError>
)

export const BorderlessInput = forwardRef(_BorderlessInput)

const _BorderlessInputPassword: React.RefForwardingComponent<
  Password,
  InlineErrorProps & PasswordProps
> = (
  {errorMessage, forceInvalid, ...props}: InlineErrorProps & PasswordProps,
  ref: Ref<Password>,
) => (
  <InlineError className="BorderlessInput" errorMessage={errorMessage} forceInvalid={forceInvalid}>
    <Password {...props} ref={ref} />
  </InlineError>
)

export const BorderlessInputPassword = forwardRef(_BorderlessInputPassword)
