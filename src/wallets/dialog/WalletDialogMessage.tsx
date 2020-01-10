import React from 'react'
import './WalletDialogMessage.scss'

interface WalletDialogMessageProps {
  label?: string
  description: string
}

export const WalletDialogMessage: React.FunctionComponent<WalletDialogMessageProps> = ({
  label,
  description,
}: WalletDialogMessageProps) => (
  <div className="WalletDialogMessage">
    {label && <div className="label">{label}</div>}
    <div className="description">{description}</div>
  </div>
)
