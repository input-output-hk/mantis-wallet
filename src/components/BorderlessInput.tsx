import React from 'react'
import classnames from 'classnames'
import {Input} from 'antd'
import {InputProps} from 'antd/lib/input'
import './BorderlessInput.scss'

export const BorderlessInput: React.FunctionComponent<InputProps> = ({
  className,
  // eslint is disabled on the next line because of fp/no-rest-parameters rule
  // but specifying it makes react fail
  ...props // eslint-disable-line
}: InputProps) => <Input className={classnames(className, 'BorderlessInput')} {...props} />
