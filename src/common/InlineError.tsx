import React, {FunctionComponent, PropsWithChildren} from 'react'
import classnames from 'classnames'
import './InlineError.scss'

export interface InlineErrorProps {
  errorMessage?: string
  className?: string
  forceInvalid?: boolean
}

export const InlineError: FunctionComponent<InlineErrorProps> = ({
  errorMessage,
  className,
  forceInvalid,
  children,
}: PropsWithChildren<InlineErrorProps>) => (
  <div className={classnames('InlineError', className, {invalid: forceInvalid || !!errorMessage})}>
    {errorMessage && <div className="error-message">{errorMessage}</div>}
    {children}
  </div>
)
