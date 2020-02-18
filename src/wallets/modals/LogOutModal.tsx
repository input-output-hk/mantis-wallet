import React, {useState} from 'react'
import {LunaModal} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogMessage} from '../../common/dialog/DialogMessage'
import {ModalProps} from 'antd/lib/modal'
import {DialogInputPassword} from '../../common/dialog/DialogInput'
import {useIsMounted} from '../../common/hook-utils'
import {DialogError} from '../../common/dialog/DialogError'

interface LogOutModalProps {
  onLogOut: (passphrase: string) => Promise<boolean>
}

export const LogOutModal: React.FunctionComponent<LogOutModalProps & ModalProps> = ({
  onLogOut,
  ...props
}: LogOutModalProps & ModalProps) => {
  const [inProgress, setInProgress] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [passphrase, setPassphrase] = useState('')

  const mounted = useIsMounted()

  return (
    <LunaModal {...props}>
      <Dialog
        title="Log Out"
        prevButtonProps={{
          onClick: props.onCancel,
        }}
        nextButtonProps={{
          onClick: async (): Promise<void> => {
            setInProgress(true)
            try {
              const loggedOut = await onLogOut(passphrase)
              if (!loggedOut) {
                if (mounted.current) setErrorMessage('Log out was not successful.')
              }
            } catch (e) {
              if (mounted.current) setErrorMessage(e.message)
            } finally {
              if (mounted.current) setInProgress(false)
            }
          },
          loading: inProgress,
          children: 'Log Out',
        }}
        footer={errorMessage && <DialogError>{errorMessage}</DialogError>}
      >
        <DialogMessage description="Enter your password to log out." />
        <DialogInputPassword onChange={(e) => setPassphrase(e.target.value)} />
      </Dialog>
    </LunaModal>
  )
}
