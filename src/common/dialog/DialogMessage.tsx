import React, {FunctionComponent, PropsWithChildren} from 'react'
import classnames from 'classnames'
import './DialogMessage.scss'

interface DialogMessageProps {
  label?: string
  type?: 'default' | 'highlight'
}

export const DialogMessage: FunctionComponent<DialogMessageProps> = ({
  label,
  children,
  type = 'default',
}: PropsWithChildren<DialogMessageProps>) => (
  <div className={classnames('DialogMessage', type)}>
    {label && <div className="label">{label}</div>}
    <div className="description">{children}</div>
  </div>
)
