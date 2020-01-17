import React from 'react'
import classnames from 'classnames'
import './InlineError.scss'

interface InlineErrorProps {
  errorMessage?: string
  className?: string
}

export const InlineError: React.FunctionComponent<InlineErrorProps> = ({
  errorMessage,
  className,
  children,
}: React.PropsWithChildren<InlineErrorProps>) => (
  <div className={classnames('InlineError', className, {invalid: !!errorMessage})}>
    {errorMessage && <div className="error-message">{errorMessage}</div>}
    {children}
  </div>
)
