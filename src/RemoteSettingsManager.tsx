import React, {useState, useEffect, Dispatch, SetStateAction} from 'react'
import {none, Option, isNone, some} from 'fp-ts/lib/Option'
import {message} from 'antd'
import {IPCToRendererChannelName} from './shared/ipc-types'
import {wrapWithModal} from './common/LunaModal'
import {Dialog} from './common/Dialog'
import {ipcListenToMain, restartClients, updateMiningConfig} from './common/ipc-util'
import {DialogInput} from './common/dialog/DialogInput'
import {DialogError} from './common/dialog/DialogError'
import {DialogMessage} from './common/dialog/DialogMessage'
import {rendererLog} from './common/logger'
import {Trans} from './common/Trans'
import {useTranslation} from './settings-state'
import './RestartPrompt.scss'

interface MiningConfigModalProps {
  onCancel: () => void
  onFinish: () => void
}

const _MiningConfigModal = ({onCancel, onFinish}: MiningConfigModalProps): JSX.Element => {
  const {t} = useTranslation()
  const [spendingKey, setSpendingKey] = useState<string>('')
  const [isLoading, setLoading] = useState<boolean>(false)
  const [response, setResponse] = useState<Option<'ok' | {errorMsg: string}>>(none)

  const footer = !isNone(response) && response.value !== 'ok' && (
    <DialogError>{response.value.errorMsg}</DialogError>
  )

  useEffect(() => {
    ipcListenToMain('enable-mining-success', () => {
      setResponse(some('ok'))
      setLoading(false)
      onFinish()
      onCancel()
    })

    ipcListenToMain('enable-mining-failure', (_event, errorMsg: string): void => {
      setResponse(some({errorMsg}))
      setLoading(false)
    })
  }, [])

  const enableMining = async (): Promise<void> => {
    updateMiningConfig(spendingKey)
    setLoading(true)
  }

  return (
    <Dialog
      title={t(['settings', 'title', 'enableMining'])}
      rightButtonProps={{
        children: t(['settings', 'button', 'enable']),
        onClick: enableMining,
        disabled: isLoading || !spendingKey,
      }}
      leftButtonProps={{
        children: t(['common', 'button', 'cancel']),
        type: 'default',
        onClick: onCancel,
        disabled: isLoading,
      }}
      type="dark"
      footer={footer}
    >
      <div className="MiningConfigModal">
        <DialogMessage>
          <Trans k={['settings', 'message', 'enableMining']} />
        </DialogMessage>
        <DialogInput
          label={t(['settings', 'label', 'privateKeyForMining'])}
          value={spendingKey}
          onChange={(e): void => setSpendingKey(e.target.value)}
        />
      </div>
    </Dialog>
  )
}

export const miningConfigChannels: IPCToRendererChannelName[] = [
  'enable-mining-success',
  'enable-mining-failure',
]

interface RestartPromptProps {
  onRestart: () => void
  onCancel: () => void
}

export const MiningConfigModal = wrapWithModal(_MiningConfigModal, 'MiningConfigModal')

const _RestartPrompt = ({onRestart, onCancel}: RestartPromptProps): JSX.Element => {
  const {t} = useTranslation()

  return (
    <Dialog
      title={t(['settings', 'title', 'backendConfigChanged'])}
      rightButtonProps={{
        children: t(['settings', 'button', 'restart']),
        onClick: onRestart,
      }}
      leftButtonProps={{
        children: t(['common', 'button', 'cancel']),
        type: 'default',
        onClick: onCancel,
      }}
      type="dark"
    >
      <div className="RestartPrompt">
        <Trans k={['settings', 'message', 'backendRestartPrompt']} />
      </div>
    </Dialog>
  )
}

export const RestartPrompt = wrapWithModal(_RestartPrompt, 'RestartPrompt')

interface RemoteSettingsManagerProps {
  setBackendRunning: Dispatch<SetStateAction<boolean>>
}

export const RemoteSettingsManager = ({
  setBackendRunning,
}: RemoteSettingsManagerProps): JSX.Element => {
  const [modalOpen, setModalOpen] = useState(false)
  const {t} = useTranslation()

  useEffect(() => {
    ipcListenToMain('update-config-success', () => {
      setModalOpen(true)
    })

    ipcListenToMain('update-config-failure', (_event, msg: string) => {
      message.error(t(['settings', 'error', 'configFailed'], {replace: {reason: msg}}), 10)
      rendererLog.error(msg)
    })

    ipcListenToMain('restart-clients-success', (_event) => {
      setBackendRunning(false)
    })

    ipcListenToMain('restart-clients-failure', (_event, msg: string) => {
      message.error(t(['settings', 'error', 'backendRestartFailed'], {replace: {reason: msg}}), 10)
      rendererLog.error(msg)
    })
  }, [])

  return (
    <RestartPrompt
      visible={modalOpen}
      onRestart={() => {
        setModalOpen(false)
        restartClients()
      }}
      onCancel={() => setModalOpen(false)}
    />
  )
}
