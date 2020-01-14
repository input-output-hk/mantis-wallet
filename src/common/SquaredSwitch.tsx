import React from 'react'
import classnames from 'classnames'
import {Switch} from 'antd'
import {SwitchProps} from 'antd/lib/switch'
import './SquaredSwitch.scss'

export const SquareSwitch: React.FunctionComponent<SwitchProps> = ({
  className,
  ...props
}: SwitchProps) => <Switch className={classnames(className, 'SquaredSwitch')} {...props} />
