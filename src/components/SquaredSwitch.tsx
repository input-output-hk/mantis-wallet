import React from 'react'
import classnames from 'classnames'
import {Switch} from 'antd'
import {SwitchProps} from 'antd/lib/switch'
import './SquaredSwitch.scss'

export const SquareSwitch: React.FunctionComponent<SwitchProps> = ({
  className,
  // eslint is disabled on the next line because of fp/no-rest-parameters rule
  // but specifying it makes react fail
  ...props // eslint-disable-line
}: SwitchProps) => <Switch className={classnames(className, 'SquaredSwitch')} {...props} />
