import React from 'react'
import {Input} from 'antd'
import {InputProps, PasswordProps} from 'antd/lib/input'
import {InlineError} from './InlineError'
import './BorderlessInput.scss'

export interface InputErrorProps {
  errorMessage?: string
}

export const BorderlessInput: React.FunctionComponent<InputErrorProps & InputProps> = ({
  errorMessage,
  ...props
}: InputErrorProps & InputProps) => (
  <InlineError className="BorderlessInput" errorMessage={errorMessage}>
    <Input {...props} />
  </InlineError>
)

export const BorderlessInputPassword: React.FunctionComponent<InputErrorProps & PasswordProps> = ({
  errorMessage,
  ...props
}: InputErrorProps & PasswordProps) => (
  <InlineError className="BorderlessInput" errorMessage={errorMessage}>
    <Input.Password {...props} />
  </InlineError>
)
