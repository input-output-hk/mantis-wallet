import React, {FunctionComponent} from 'react'
import classnames from 'classnames'
import {Switch} from 'antd'
import {SwitchProps} from 'antd/lib/switch'
import './SquaredSwitch.scss'

// TODO: remove - use normal switch instead
export const SquareSwitch: FunctionComponent<SwitchProps> = ({
  className,
  ...props
}: SwitchProps) => <Switch className={classnames(className, 'SquaredSwitch')} {...props} />
