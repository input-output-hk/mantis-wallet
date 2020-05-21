import React from 'react'
import {Icon, Popover} from 'antd'

export const InfoIcon = ({content}: {content: React.ReactNode}): JSX.Element => (
  <Popover content={content}>
    <Icon type="info-circle" />
  </Popover>
)
