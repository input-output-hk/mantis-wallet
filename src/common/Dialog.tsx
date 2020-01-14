import React from 'react'
import {Button} from 'antd'
import './Dialog.scss'

interface DialogProps {
  title: string
  prevButtonLabel?: string
  prevButtonAction: () => void
  nextButtonLabel?: string
  nextButtonAction: () => void
  nextButtonDisabled?: boolean
}

export const Dialog: React.FunctionComponent<DialogProps> = ({
  title,
  prevButtonLabel = 'Cancel',
  nextButtonLabel = 'Next →',
  prevButtonAction,
  nextButtonAction,
  nextButtonDisabled = false,
  children,
}: React.PropsWithChildren<DialogProps>) => (
  <div className="Dialog">
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
