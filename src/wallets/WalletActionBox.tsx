import React from 'react'
import SVG from 'react-inlinesvg'
import './WalletActionBox.scss'

interface WalletActionBoxProps {
  icon: string
  title: string
  description: string
  buttonLabel: string
  onClick: () => void
}

export const WalletActionBox = (props: WalletActionBoxProps): JSX.Element => {
  const {icon, title, description, buttonLabel, onClick} = props

  return (
    <div className="WalletActionBox" onClick={onClick}>
      <SVG src={icon} className="svg" />
      <div className="title">{title}</div>
      <div className="note">{description}</div>
      <div className="footer">{buttonLabel}</div>
    </div>
  )
}
