import React from 'react'
import {HeaderWithSyncStatus} from '../common/HeaderWithSyncStatus'
import {LINKS} from '../external-link-config'
import {Link} from '../common/Link'
import './PobLayout.scss'

interface PobLayoutProps {
  title: string
}

export const PobLayout: React.FunctionComponent<PobLayoutProps> = ({
  title,
  children,
}: React.PropsWithChildren<PobLayoutProps>) => {
  return (
    <div className="PobLayout">
      <HeaderWithSyncStatus>
        {title}
        <div className="link">
          <Link href={LINKS.aboutPoB}>Learn more about Proof of Burn</Link>
        </div>
      </HeaderWithSyncStatus>
      <div className="content">{children}</div>
    </div>
  )
}
