import React, {useState} from 'react'
import {Dialog} from '../../common/Dialog'
import './BurnCoinsTransparentAddress.scss'
import {DialogError} from '../../common/dialog/DialogError'
import {useIsMounted} from '../../common/hook-utils'

interface BurnCoinsNoWalletProps {
  cancel: () => void
  generateTransparentAddress: () => Promise<void>
}

export const BurnCoinsTransparentAddress: React.FunctionComponent<BurnCoinsNoWalletProps> = ({
  cancel,
  generateTransparentAddress,
}: BurnCoinsNoWalletProps) => {
  const [inProgress, setInProgress] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const mounted = useIsMounted()

  const errors = errorMessage && <DialogError>{errorMessage}</DialogError>

  return (
    <div className="BurnCoinsTransparentAddress">
      <Dialog
        title="You need a transparent address to continue"
        leftButtonProps={{onClick: cancel}}
        rightButtonProps={{
          children: 'Generate Transparent Address',
          onClick: async (): Promise<void> => {
            if (mounted.current) setInProgress(true)
            try {
              await generateTransparentAddress()
            } catch (e) {
              if (mounted.current) setErrorMessage(e.message)
            } finally {
              if (mounted.current) setInProgress(false)
            }
          },
          loading: inProgress,
        }}
        footer={errors}
      />
    </div>
  )
}
