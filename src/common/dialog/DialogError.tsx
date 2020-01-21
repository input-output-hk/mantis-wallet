import React from 'react'
import './DialogError.scss'

export const DialogError: React.FunctionComponent<{}> = ({
  children,
}: React.PropsWithChildren<{}>) => <div className="DialogError">{children}</div>
