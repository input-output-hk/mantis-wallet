import React, {useState} from 'react'
import {ModalProps} from 'antd/lib/modal'
import {LunaModal} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogMessage} from '../../common/dialog/DialogMessage'
import {DialogInputPassword} from '../../common/dialog/DialogInput'
import {useIsMounted} from '../../common/hook-utils'
import {DialogError} from '../../common/dialog/DialogError'
import {DialogApproval} from '../../common/dialog/DialogApproval'

interface LogOutModalProps {
  onLogOut: (passphrase: string) => Promise<boolean>
}

export const LogOutModal: React.FunctionComponent<LogOutModalProps & ModalProps> = ({
  onLogOut,
  ...props
}: LogOutModalProps & ModalProps) => {
  const [inProgress, setInProgress] = useState(false)
  const [approve, setApprove] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [passphrase, setPassphrase] = useState('')

  const mounted = useIsMounted()

  return (
    <LunaModal {...props}>
      <Dialog
        title="Log Out"
        leftButtonProps={{
          onClick: props.onCancel,
        }}
        rightButtonProps={{
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
          disabled: !approve,
          loading: inProgress,
          children: 'Log Out',
        }}
        footer={errorMessage && <DialogError>{errorMessage}</DialogError>}
      >
        <DialogMessage description="Enter your password to log out." />
        <DialogInputPassword onChange={(e) => setPassphrase(e.target.value)} />
        <DialogApproval
          checked={approve}
          onChange={setApprove}
          description="I understand that all my Burn Addresses and Glacier Drop Claims will be deleted from this machine."
        />
      </Dialog>
    </LunaModal>
  )
}
