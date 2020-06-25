import React, {useEffect} from 'react'
import {shell} from 'electron'
import {message} from 'antd'
import {IPCToRendererChannelName} from '../shared/ipc-types'
import {saveDebugLogs, ipcListenToMain, ipcRemoveAllListeners} from './ipc-util'
import {DialogMessage} from './dialog/DialogMessage'
import {wrapWithModal, ModalLocker} from './LunaModal'
import {Dialog} from './Dialog'
import {LINKS} from '../external-link-config'

const CHANNELS: IPCToRendererChannelName[] = [
  'save-debug-logs-success',
  'save-debug-logs-cancel',
  'save-debug-logs-failure',
]

export const SupportDialog = (): JSX.Element => {
  const {setLocked, isLocked} = ModalLocker.useContainer()

  useEffect(() => {
    ipcListenToMain('save-debug-logs-success', (): void => {
      message.success('Debug logs saved successfully!', 5)
      setLocked(false)
    })

    ipcListenToMain('save-debug-logs-cancel', () => {
      message.info('Operation cancelled.', 5)
      setLocked(false)
    })

    ipcListenToMain('save-debug-logs-failure', (_event, errorMsg: string): void => {
      message.error(`Failed to save debug logs: ${errorMsg}`, 10)
      setLocked(false)
    })

    return () => {
      CHANNELS.map(ipcRemoveAllListeners)
    }
  }, [])

  return (
    <Dialog
      title="Support"
      leftButtonProps={{
        onClick: () => {
          saveDebugLogs()
          setLocked(true)
        },
        children: 'Export Logs',
        disabled: isLocked,
      }}
      rightButtonProps={{
        onClick: async (): Promise<void> => shell.openExternal(LINKS.support),
        children: 'Open Slack',
        disabled: isLocked,
      }}
    >
      <DialogMessage>
        <p>If you encounter a bug, don&apos;t hesitate to contact our support team on Slack.</p>
        <p>
          To make it easier for us to diagnose your problem, please, include your debug logs in the
          bug report.
        </p>
        <p>
          You can easily save your logs by clicking the <b>Export Logs</b> button below.
        </p>
      </DialogMessage>
    </Dialog>
  )
}

export const SupportModal = wrapWithModal(SupportDialog)
