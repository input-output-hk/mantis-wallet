import React from 'react'
import {Modal} from 'antd'
import classnames from 'classnames'
import {ModalProps} from 'antd/lib/modal'
import {Config, displayNameOfNetwork} from '../config/type'
import {SynchronizationStatus} from './wallet-state'
import {CopyableLongText} from './CopyableLongText'
import {SyncMessage} from './SyncStatus'
import {BackendState} from './backend-state'
import {useTranslation, useFormatters} from '../settings-state'
import {TKeyRenderer} from './i18n'
import {Trans} from './Trans'
import {FAILURE_FOR_DAG, PROGRESS_FOR_DAG} from '../shared/dagStatus'
import './StatusModal.scss'

const statusToTranslation: Record<ProcessStatus, TKeyRenderer> = {
  notRunning: ['status', 'componentStatus', 'notRunning'],
  running: ['status', 'componentStatus', 'running'],
  failed: ['status', 'componentStatus', 'failed'],
  finished: ['status', 'componentStatus', 'finished'],
}

const VisibleStatus = ({status}: {status: ProcessStatus}): JSX.Element => {
  const specificClassName = status === 'notRunning' || status === 'failed' ? 'error' : 'success'

  return (
    <span className={classnames('status', specificClassName)}>
      <Trans k={statusToTranslation[status]} />
    </span>
  )
}

const DisplaySyncStatus = ({syncStatus}: {syncStatus: SynchronizationStatus}): JSX.Element => (
  <span className={classnames('status', {success: syncStatus?.mode === 'offline'})}>
    <SyncMessage syncStatus={syncStatus} />
  </span>
)

const dagErrorToTranslation: Record<typeof FAILURE_FOR_DAG[number], TKeyRenderer> = {
  'DAG file ended unexpectedly': ['status', 'error', 'dagFileEndedUnexpectedly'],
  'Invalid DAG file prefix': ['status', 'error', 'invalidDagFilePrefix'],
  'Cannot read DAG from file': ['status', 'error', 'cannotReadDagFromFile'],
  'Cannot generate DAG file': ['status', 'error', 'cannotGenerateDagFile'],
}

const localizeDagLoadingStatus = (
  message = '',
): {tKey: TKeyRenderer; percentage: string} | null => {
  const matches = PROGRESS_FOR_DAG.map((progressRegex) => message.match(progressRegex)).filter(
    (res): res is RegExpMatchArray => res != null,
  )
  if (matches.length === 0) return null
  const [[fullRegexMatch, percentage]] = matches
  return {
    tKey: fullRegexMatch.startsWith('Generating DAG')
      ? ['status', 'message', 'generatingDag']
      : ['status', 'message', 'loadingDagFromFile'],
    percentage: percentage,
  }
}

const DisplayDagStatus = ({
  dag: {status, message},
}: {
  dag: {status: ProcessStatus; message?: string}
}): JSX.Element => {
  if (status === 'finished')
    return (
      <span className="status success">
        <Trans k={['status', 'componentStatus', 'loaded']} />
      </span>
    )

  if (status === 'failed') {
    const dagError = (message &&
      (dagErrorToTranslation as Record<string, TKeyRenderer>)[message]) || [
      'common',
      'error',
      'unexpectedError',
    ]
    return (
      <span className="status error">
        <Trans k={dagError} />
      </span>
    )
  }

  const loadingStatus = localizeDagLoadingStatus(message)
  return loadingStatus == null ? (
    <>-</>
  ) : (
    <Trans k={loadingStatus.tKey} values={{percentage: loadingStatus.percentage}} />
  )
}

interface StatusModalProps extends Pick<ModalProps, 'visible' | 'onCancel'> {
  status: MantisWalletStatus
  config: Pick<Config, 'dataDir' | 'rpcAddress'>
  syncStatus?: SynchronizationStatus
}

export const StatusModal = ({
  status,
  config,
  syncStatus,
  ...props
}: StatusModalProps): JSX.Element => {
  const {networkName} = BackendState.useContainer()
  const {t} = useTranslation()
  const {formatFileSize} = useFormatters()

  const getLabel = (key: TKeyRenderer): string => `${t(key)}:`

  return (
    <Modal
      width="auto"
      footer={null}
      className="StatusModal"
      wrapClassName="StatusModalWrap"
      centered
      {...props}
    >
      <div className="content">
        <div>
          <div className="title">{t(['status', 'label', 'computer'])}</div>
          <div className="info-item">
            <div>{getLabel(['status', 'label', 'operatingSystem'])}</div>
            <div className="info-value">{status.info.platform}</div>
          </div>
          <div className="info-item">
            <div>{getLabel(['status', 'label', 'operatingSystemVersion'])}</div>
            <div className="info-value">{status.info.platformVersion}</div>
          </div>
          <div className="info-item">
            <div>{getLabel(['status', 'label', 'cpu'])}</div>
            <div className="info-value">{status.info.cpu}</div>
          </div>
          <div className="info-item">
            <div>{getLabel(['status', 'label', 'computerMemory'])}</div>
            <div className="info-value">{formatFileSize(status.info.memory)}</div>
          </div>
          <div className="title">{t(['title', 'mantisWallet'])}</div>
          <div className="info-item">
            <div>{getLabel(['status', 'label', 'mantisWalletVersion'])}</div>
            <div className="info-value">{status.info.mantisWalletVersion}</div>
          </div>
          <div className="info-item">
            <div>{getLabel(['status', 'label', 'mantisWalletMainProcessID'])}</div>
            <div className="info-value">{status.info.mainPid}</div>
          </div>
          <div className="info-item">
            <div>{getLabel(['status', 'label', 'mantisWalletRendererProcessID'])}</div>
            <div className="info-value">{process.pid}</div>
          </div>
          <div className="info-item">
            <div>{getLabel(['status', 'label', 'mantisWalletLocalDirectory'])}</div>
            <div className="info-value">
              <CopyableLongText content={config.dataDir} />
            </div>
          </div>
        </div>
        <div>
          <div className="title">{t(['status', 'label', 'backend'])}</div>
          <div className="info-item">
            <div>{getLabel(['status', 'label', 'network'])}</div>
            <div className="info-value">{displayNameOfNetwork(networkName, t)}</div>
          </div>
          <div className="info-item">
            <div>{getLabel(['status', 'label', 'nodeStatus'])}</div>
            <div className="info-value">
              <VisibleStatus status={status.node.status} />
            </div>
          </div>
          <div className="info-item">
            <div>{getLabel(['status', 'label', 'nodeProcessID'])}</div>
            <div className="info-value">{status.node.pid || '-'}</div>
          </div>
          <div className="info-item">
            <div>{getLabel(['status', 'label', 'walletRpcAddress'])}</div>
            <div className="info-value">
              <CopyableLongText content={config.rpcAddress.toString()} />
            </div>
          </div>
          <div className="info-item">
            <div>{getLabel(['status', 'label', 'lastDagInformation'])}</div>
            <div className="info-value">
              <DisplayDagStatus dag={status.dag} />
            </div>
          </div>
          <div className="info-item">
            <div>{getLabel(['status', 'label', 'synchronizationStatus'])}</div>
            <div className="info-value">
              {syncStatus == null ? (
                <VisibleStatus status={'notRunning'} />
              ) : (
                <DisplaySyncStatus syncStatus={syncStatus} />
              )}
            </div>
          </div>
          <div className="info-item">
            <div>{getLabel(['status', 'label', 'currentBlock'])}</div>
            <div className="info-value">{syncStatus?.currentBlock || '-'}</div>
          </div>
          <div className="info-item">
            <div>{getLabel(['status', 'label', 'highestKnownBlock'])}</div>
            <div className="info-value">
              {(syncStatus?.mode === 'online' && syncStatus.highestKnownBlock) || '-'}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
