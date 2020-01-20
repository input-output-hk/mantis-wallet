import React from 'react'
import classnames from 'classnames'
import './InlineError.scss'

export interface InlineErrorProps {
  errorMessage?: string
  className?: string
  forceInvalid?: boolean
}

export const InlineError: React.FunctionComponent<InlineErrorProps> = ({
  errorMessage,
  className,
  forceInvalid,
  children,
}: React.PropsWithChildren<InlineErrorProps>) => (
  <div className={classnames('InlineError', className, {invalid: forceInvalid || !!errorMessage})}>
    {errorMessage && <div className="error-message">{errorMessage}</div>}
    {children}
  </div>
)
