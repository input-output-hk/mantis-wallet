import React from 'react'
import {InfoCircleOutlined} from '@ant-design/icons'
import {Popover} from 'antd'

export const InfoIcon = ({content}: {content: React.ReactNode}): JSX.Element => (
  <Popover content={content}>
    <InfoCircleOutlined />
  </Popover>
)
