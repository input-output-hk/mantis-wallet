import React, {Ref, forwardRef, RefForwardingComponent} from 'react'
import {Input} from 'antd'
import Password from 'antd/lib/input/Password'
import TextArea, {TextAreaProps} from 'antd/lib/input/TextArea'
import {InputProps, PasswordProps} from 'antd/lib/input'
import {InlineError, InlineErrorProps} from './InlineError'
import './BorderlessInput.scss'

// prefix, suffix and visibilityToggle brakes BorderlessInput design, they will be disallowed
type GenericBorderlessInputProps<T> = InlineErrorProps &
  Omit<T, 'prefix' | 'suffix' | 'visibilityToggle'>

export type BorderlessInputProps = GenericBorderlessInputProps<InputProps>
export type BorderlessInputPasswordProps = GenericBorderlessInputProps<PasswordProps>
export type BorderlessInputTextAreaProps = GenericBorderlessInputProps<TextAreaProps>

const _BorderlessInput: RefForwardingComponent<Input, BorderlessInputProps> = (
  {errorMessage, forceInvalid, ...props}: BorderlessInputProps,
  ref: Ref<Input>,
) => (
  <InlineError className="BorderlessInput" errorMessage={errorMessage} forceInvalid={forceInvalid}>
    <Input {...props} ref={ref} />
  </InlineError>
)

const _BorderlessInputPassword: RefForwardingComponent<Password, BorderlessInputPasswordProps> = (
  {errorMessage, forceInvalid, ...props}: BorderlessInputPasswordProps,
  ref: Ref<Password>,
) => (
  <InlineError className="BorderlessInput" errorMessage={errorMessage} forceInvalid={forceInvalid}>
    <Password visibilityToggle={false} {...props} ref={ref} />
  </InlineError>
)

const _BorderlessInputTextArea: RefForwardingComponent<TextArea, BorderlessInputTextAreaProps> = (
  {errorMessage, forceInvalid, ...props}: BorderlessInputTextAreaProps,
  ref: Ref<TextArea>,
) => (
  <InlineError className="BorderlessInput" errorMessage={errorMessage} forceInvalid={forceInvalid}>
    <TextArea {...props} ref={ref} />
  </InlineError>
)

export const BorderlessInput = forwardRef(_BorderlessInput)
export const BorderlessInputPassword = forwardRef(_BorderlessInputPassword)
export const BorderlessInputTextArea = forwardRef(_BorderlessInputTextArea)
