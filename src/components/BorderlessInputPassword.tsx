import React from 'react'
import classnames from 'classnames'
import {Input} from 'antd'
import {PasswordProps} from 'antd/lib/input'
import './BorderlessInput.scss'

export const BorderlessInputPassword: React.FunctionComponent<PasswordProps> = ({
  className,
  ...props
}: PasswordProps) => (
  <Input.Password className={classnames(className, 'BorderlessInput')} {...props} />
)
