import React from 'react'
import classnames from 'classnames'
import {Input} from 'antd'
import {InputProps} from 'antd/lib/input'
import './BorderlessInput.scss'

export const BorderlessInput: React.FunctionComponent<InputProps> = ({
  className,
  ...props
}: InputProps) => <Input className={classnames(className, 'BorderlessInput')} {...props} />
