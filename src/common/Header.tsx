import React, {PropsWithChildren} from 'react'
import {Link} from './Link'
import './Header.scss'

interface HeaderProps {
  externalLink?: {
    text: string
    url: string
  }
}

export const Header = ({externalLink, children}: PropsWithChildren<HeaderProps>): JSX.Element => (
  <div className="Header">
    <div className="main-title">
      {children}
      {externalLink && (
        <div className="external-link">
          <Link href={externalLink.url} popoverPlacement="right" styled>
            {externalLink.text}
          </Link>
        </div>
      )}
    </div>
  </div>
)
