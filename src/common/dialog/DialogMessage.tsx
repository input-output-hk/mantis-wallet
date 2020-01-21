import React from 'react'
import './DialogMessage.scss'

interface DialogMessageProps {
  label?: string
  description: string
}

export const DialogMessage: React.FunctionComponent<DialogMessageProps> = ({
  label,
  description,
}: DialogMessageProps) => (
  <div className="DialogMessage">
    {label && <div className="label">{label}</div>}
    <div className="description">{description}</div>
  </div>
)
