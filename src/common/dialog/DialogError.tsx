import React from 'react'
import './DialogError.scss'
import {Link} from '../Link'

interface DialogErrorProps {
  helpURL?: string | null
}

export const DialogError = ({
  children,
  helpURL = null,
}: React.PropsWithChildren<DialogErrorProps>): JSX.Element => (
  <div className="DialogError">
    {children}
    {helpURL && (
      <Link href={helpURL} className="help">
        Learn more
      </Link>
    )}
  </div>
)
