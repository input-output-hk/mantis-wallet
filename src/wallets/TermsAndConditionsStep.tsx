import React from 'react'
import {Dialog} from '../common/Dialog'
import {DialogApproval} from '../common/dialog/DialogApproval'
import {useTranslation} from '../settings-state'
import {TermsAndConditions} from './TermsAndConditions'
import './TermsAndConditions.scss'

interface TermsAndConditionsProps {
  next: () => void
}

export const TermsAndConditionsStep = ({next}: TermsAndConditionsProps): JSX.Element => {
  const {t} = useTranslation()

  return (
    <Dialog
      title={t(['wallet', 'title', 'termsAndConditions'])}
      leftButtonProps={{doNotRender: true}}
      rightButtonProps={{
        onClick: async (): Promise<void> => next(),
      }}
      className={['TermsAndConditions']}
    >
      <div className="scrollable">
        <TermsAndConditions />
      </div>
      <DialogApproval
        id="termsAndConditionsApproval"
        description={t(['wallet', 'message', 'termsAndConditionsApproval'])}
        autoFocus
      />
    </Dialog>
  )
}
