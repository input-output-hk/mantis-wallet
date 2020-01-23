import React from 'react'
import {Input} from 'antd'
import {InputProps, PasswordProps} from 'antd/lib/input'
import {InlineError, InlineErrorProps} from './InlineError'
import './BorderlessInput.scss'

export const BorderlessInput: React.FunctionComponent<InlineErrorProps & InputProps> = ({
  errorMessage,
  forceInvalid,
  ...props
}: InlineErrorProps & InputProps) => (
  <InlineError className="BorderlessInput" errorMessage={errorMessage} forceInvalid={forceInvalid}>
    <Input {...props} />
  </InlineError>
)

export const BorderlessInputPassword: React.FunctionComponent<InlineErrorProps & PasswordProps> = ({
  errorMessage,
  forceInvalid,
  ...props
}: InlineErrorProps & PasswordProps) => (
  <InlineError className="BorderlessInput" errorMessage={errorMessage} forceInvalid={forceInvalid}>
    <Input.Password {...props} />
  </InlineError>
)
