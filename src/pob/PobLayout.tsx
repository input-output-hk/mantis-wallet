import React from 'react'
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
      <div className="header">
        <div className="title">{title}</div>
        <div className="more">
          <span className="link">More About the Proof of Burn</span>
        </div>
      </div>
      <div className="content">{children}</div>
    </div>
  )
}
