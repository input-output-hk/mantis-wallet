import React, {PropsWithChildren} from 'react'
import _ from 'lodash'
import {shell} from 'electron'
import {Popover} from 'antd'
import {TooltipPlacement} from 'antd/lib/tooltip'
import classnames from 'classnames'
import {fillActionHandlers} from './util'
import './Link.scss'

interface LinkProps {
  href: string
  className?: string
  styled?: boolean
  popoverPlacement?: TooltipPlacement | undefined
}

export const Link = ({
  children,
  href,
  className = '',
  styled = false,
  popoverPlacement = undefined,
}: PropsWithChildren<LinkProps>): JSX.Element => (
  <span
    className={classnames('Link', className, {styled: styled})}
    {...fillActionHandlers((event) => {
      event?.preventDefault()
      shell.openExternal(href)
    })}
  >
    <Popover content={_.truncate(href, {length: 40})} placement={popoverPlacement}>
      <span>{children}</span>
    </Popover>
  </span>
)
