import React, {FunctionComponent, useState} from 'react'
import {wrapWithModal, ModalLocker, ModalOnCancel} from '../../common/MantisModal'
import {Dialog} from '../../common/Dialog'
import {DialogMessage} from '../../common/dialog/DialogMessage'
import {NetworkName} from '../../config/type'
import {BackendState} from '../../common/backend-state'
import {canResetWallet, WalletData} from '../../common/wallet-state'
import {Trans} from '../../common/Trans'
import {useTranslation} from '../../settings-state'
import {DialogInput} from '../../common/dialog/DialogInput'
import {EDITION} from '../../shared/version'

interface ChangeNetworkModalProps extends ModalOnCancel {
  newNetwork: NetworkName
  walletState?: WalletData
}

const ChangeNetworkDialog: FunctionComponent<ChangeNetworkModalProps> = ({
  newNetwork,
  onCancel,
  walletState,
}: ChangeNetworkModalProps) => {
  const modalLocker = ModalLocker.useContainer()
  const {setNetworkName} = BackendState.useContainer()
  const {t} = useTranslation()

  const [customNetworkName, setCustomNetworkName] = useState('')
  const [mainnetValidation, setMainnetValidation] = useState('')

  if (walletState && !canResetWallet(walletState)) {
    throw Error()
  }

  return (
    <Dialog
      title={<Trans k={['network', 'changeNetworkModal', 'title']} />}
      leftButtonProps={{
        onClick: onCancel,
        disabled: modalLocker.isLocked,
      }}
      rightButtonProps={{
        onClick: (e) => {
          setNetworkName(newNetwork === 'custom' ? customNetworkName : newNetwork)
          walletState && walletState.reset()
          onCancel(e)
        },
        children: <Trans k={['network', 'changeNetworkModal', 'confirm']} />,
        danger: true,
        disabled: newNetwork === 'etc' && mainnetValidation !== 'MAINNET',
      }}
      onSetLoading={modalLocker.setLocked}
    >
      <DialogMessage>
        <Trans
          k={['network', 'changeNetworkModal', 'message']}
          // FIXME: ETCM-342 remove after upgrading to TS4
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          values={{newNetwork: t(['network', 'names', newNetwork])}}
        />
      </DialogMessage>

      {newNetwork === 'custom' && (
        <>
          <DialogMessage>
            <Trans k={['network', 'changeNetworkModal', 'writeNetwork']} />
          </DialogMessage>
          <DialogInput
            value={customNetworkName}
            onChange={(event) => {
              setCustomNetworkName(event.target.value)
            }}
          />
        </>
      )}
      {newNetwork === 'etc' && (
        <>
          {EDITION === 'BETA' && (
            <DialogMessage>
              <Trans k={['network', 'changeNetworkModal', 'mainnetDisclaimer']} />
            </DialogMessage>
          )}
          <DialogMessage>
            <Trans k={['network', 'changeNetworkModal', 'typeMainnet']} />
          </DialogMessage>
          <DialogInput
            value={mainnetValidation}
            onChange={(event) => {
              setMainnetValidation(event.target.value)
            }}
          />
        </>
      )}
    </Dialog>
  )
}

export const ChangeNetworkModal = wrapWithModal(ChangeNetworkDialog)
