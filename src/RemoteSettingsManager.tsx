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
import './RestartPrompt.scss'

interface MiningConfigModalProps {
  onCancel: () => void
  onFinish: () => void
}

const _MiningConfigModal = ({onCancel, onFinish}: MiningConfigModalProps): JSX.Element => {
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
      title="Enable Mining"
      rightButtonProps={{
        children: 'Enable',
        onClick: enableMining,
        disabled: isLoading || !spendingKey,
      }}
      leftButtonProps={{
        children: 'Cancel',
        type: 'default',
        onClick: onCancel,
        disabled: isLoading,
      }}
      type="dark"
      footer={footer}
    >
      <div className="MiningConfigModal">
        <DialogMessage>
          By setting a private key, you&apos;ll enable mining on your computer.
          <br />
          It&apos;s crucial that your node is fully synced when mining, otherwise it won&apos;t
          work.
        </DialogMessage>
        <DialogInput
          label="Private key for mining rewards"
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
  return (
    <Dialog
      title="Backend Configuration Changed"
      rightButtonProps={{
        children: 'Restart',
        onClick: onRestart,
      }}
      leftButtonProps={{
        children: 'Cancel',
        type: 'default',
        onClick: onCancel,
      }}
      type="dark"
    >
      <div className="RestartPrompt">
        <p>The backend must be restarted to apply configuration changes.</p>
        <p>Do you want to restart now?</p>
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

  useEffect(() => {
    ipcListenToMain('update-config-success', () => {
      setModalOpen(true)
    })

    ipcListenToMain('update-config-failure', (_event, msg: string) => {
      message.error(`Configuration update failed. Error: ${msg}`, 10)
      rendererLog.error(msg)
    })

    ipcListenToMain('restart-clients-success', (_event) => {
      setBackendRunning(false)
    })

    ipcListenToMain('restart-clients-failure', (_event, msg: string) => {
      message.error(`Backend restart failed. Error: ${msg}`, 10)
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
