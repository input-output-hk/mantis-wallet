import React from 'react'
import {shell} from 'electron'
import './Link.scss'

interface LinkProps {
  href: string
}

export const Link = ({children, href}: React.PropsWithChildren<LinkProps>): JSX.Element => (
  <span
    className="Link"
    onClick={(event) => {
      event.preventDefault()
      shell.openExternal(href)
    }}
  >
    {children}
  </span>
)
