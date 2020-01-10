import React from 'react'
import classnames from 'classnames'
import {Input} from 'antd'
import {PasswordProps} from 'antd/lib/input'
import './BorderlessInput.scss'

export const BorderlessInputPassword: React.FunctionComponent<PasswordProps> = ({
  className,
  // eslint is disabled on the next line because of fp/no-rest-parameters rule
  // but specifying it makes react fail
  ...props // eslint-disable-line
}: PasswordProps) => (
  <Input.Password className={classnames(className, 'BorderlessInput')} {...props} />
)
