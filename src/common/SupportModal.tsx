import React, {useEffect, useState} from 'react'
import {shell} from 'electron'
import {message} from 'antd'
import {CheckCircleFilled} from '@ant-design/icons'
import {LINKS} from '../external-link-config'
import {IPCToRendererChannelName} from '../shared/ipc-types'
import {saveDebugLogs, ipcListenToMain, ipcRemoveAllListeners} from './ipc-util'
import {fillActionHandlers} from './util'
import {DismissFunction} from './dismissable-message'
import {DialogMessage} from './dialog/DialogMessage'
import {wrapWithModal, ModalLocker} from './MantisModal'
import {Dialog} from './Dialog'
import {Trans} from './Trans'
import {useTranslation, useLocalizedUtilities} from './store/settings'
import {TFunctionRenderer} from './i18n'

const CHANNELS: IPCToRendererChannelName[] = [
  'save-debug-logs-success',
  'save-debug-logs-cancel',
  'save-debug-logs-failure',
]

function createMessage(t: TFunctionRenderer, path: string) {
  return function Message({dismiss}: {dismiss: DismissFunction}) {
    const onClickMsg = (): void => {
      shell.showItemInFolder(path)
      dismiss()
    }
    return (
      <span className="link" {...fillActionHandlers(onClickMsg)}>
        {t(['common', 'message', 'debugLogsSaved'])}
      </span>
    )
  }
}

export const SupportDialog = (): JSX.Element => {
  const {t} = useTranslation()
  const {makeDismissableMessage} = useLocalizedUtilities()
  const {setLocked, isLocked} = ModalLocker.useContainer()
  const [isDone, setDone] = useState(false)

  useEffect(() => {
    ipcListenToMain('save-debug-logs-success', (_event, path): void => {
      makeDismissableMessage('success', createMessage(t, path), {duration: 0})
      setLocked(false)
      setDone(true)
    })

    ipcListenToMain('save-debug-logs-cancel', () => {
      message.info(t(['common', 'message', 'saveDebugLogsCancelled']), 5)
      setLocked(false)
    })

    ipcListenToMain('save-debug-logs-failure', (_event, errorMsg: string): void => {
      message.error(t(['common', 'error', 'failedToSaveDebugLogs'], {replace: {errorMsg}}), 10)
      setLocked(false)
    })

    return () => {
      CHANNELS.map(ipcRemoveAllListeners)
    }
  }, [])

  return (
    <Dialog
      title={t(['common', 'title', 'support'])}
      className="SupportModal"
      leftButtonProps={{
        onClick: () => {
          saveDebugLogs()
          setLocked(true)
        },
        children: t(['common', 'button', 'exportDebugLogs']),
        disabled: isLocked,
        icon: isDone && <CheckCircleFilled />,
      }}
      rightButtonProps={{
        onClick: async (): Promise<void> => shell.openExternal(LINKS.support),
        children: t(['common', 'button', 'openSupportChannel']),
        disabled: isLocked,
      }}
    >
      <DialogMessage>
        <Trans k={['common', 'message', 'supportModalMessage']} />
      </DialogMessage>
    </Dialog>
  )
}

export const SupportModal = wrapWithModal(SupportDialog)
