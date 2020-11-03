import React, {ReactNode} from 'react'
import {InfoCircleOutlined} from '@ant-design/icons'
import {Popover} from 'antd'
import {PopoverProps} from 'antd/lib/popover'

interface InfoIconProps {
  content: ReactNode
  placement?: PopoverProps['placement']
}

export const InfoIcon = ({content, placement}: InfoIconProps): JSX.Element => (
  <Popover content={content} placement={placement}>
    <InfoCircleOutlined />
  </Popover>
)
