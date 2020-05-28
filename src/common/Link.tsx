import React from 'react'
import _ from 'lodash'
import {shell} from 'electron'
import {Popover} from 'antd'
import classnames from 'classnames'
import './Link.scss'

interface LinkProps {
  href: string
  className?: string
  styled?: boolean
}

export const Link = ({
  children,
  href,
  className = '',
  styled = false,
}: React.PropsWithChildren<LinkProps>): JSX.Element => (
  <span
    className={classnames('Link', className, {styled: styled})}
    onClick={(event) => {
      event.preventDefault()
      shell.openExternal(href)
    }}
  >
    <Popover content={_.truncate(href, {length: 40})}>
      <span>{children}</span>
    </Popover>
  </span>
)
