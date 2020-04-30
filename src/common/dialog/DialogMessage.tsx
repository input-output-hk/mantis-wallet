import React from 'react'
import classnames from 'classnames'
import './DialogMessage.scss'

interface DialogMessageProps {
  label?: string
  description: React.ReactNode
  type?: 'default' | 'highlight'
}

export const DialogMessage: React.FunctionComponent<DialogMessageProps> = ({
  label,
  description,
  type = 'default',
}: DialogMessageProps) => (
  <div className={classnames('DialogMessage', type)}>
    {label && <div className="label">{label}</div>}
    <div className="description">{description}</div>
  </div>
)
