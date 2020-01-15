import React from 'react'
import {Button} from 'antd'
import './WalletDialog.scss'

interface WalletDialogProps {
  title: string
  prevButtonLabel?: string
  prevButtonAction: () => void
  nextButtonLabel?: string
  nextButtonAction: () => void
  nextButtonDisabled?: boolean
}

export const WalletDialog: React.FunctionComponent<WalletDialogProps> = ({
  title,
  prevButtonLabel = 'Cancel',
  nextButtonLabel = 'Next →',
  prevButtonAction,
  nextButtonAction,
  nextButtonDisabled = false,
  children,
}: React.PropsWithChildren<WalletDialogProps>) => (
  <div className="WalletDialog">
    <div className="title">{title}</div>
    <div>{children}</div>
    <div className="actions">
      <Button className="button" size="large" onClick={prevButtonAction}>
        {prevButtonLabel}
      </Button>
      <Button
        type="primary"
        className="button"
        size="large"
        onClick={nextButtonAction}
        disabled={nextButtonDisabled}
      >
        {nextButtonLabel}
      </Button>
    </div>
  </div>
)
