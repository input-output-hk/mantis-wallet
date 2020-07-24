import React from 'react'
import {Modal} from 'antd'
import filesize from 'filesize'
import classnames from 'classnames'
import {ModalProps} from 'antd/lib/modal'
import {isNone} from 'fp-ts/lib/Option'
import {Config, LunaManagedConfig} from '../config/type'
import {SynchronizationStatus} from './wallet-state'
import {MiningStatus} from './MiningStatus'
import {CopyableLongText} from './CopyableLongText'
import {SyncMessage} from './SyncStatus'
import {BackendState} from './backend-state'
import {NETWORK_CONSTANTS} from './constants/network'
import './StatusModal.scss'

const visibleStatus: Record<ProcessStatus, React.ReactNode> = {
  running: <span className="status success">Running</span>,
  notRunning: <span className="status error">Not Running</span>,
  finished: <span className="status success">Finished</span>,
  failed: <span className="status error">Failed</span>,
}

const DisplaySyncStatus = ({syncStatus}: {syncStatus?: SynchronizationStatus}): JSX.Element => (
  <span
    className={classnames('status', {error: !syncStatus, success: syncStatus?.mode === 'offline'})}
  >
    {!syncStatus ? 'Not Running' : <SyncMessage syncStatus={syncStatus} />}
  </span>
)

const DisplayDagStatus = ({
  dag: {status, message},
}: {
  dag: {status: ProcessStatus; message?: string}
}): JSX.Element => {
  if (status === 'finished') return <span className="status success">Loaded</span>
  if (status === 'failed')
    return <span className="status error">{message || 'Unexpected error'}</span>
  return <>{message || '-'}</>
}

interface StatusModalProps extends Pick<ModalProps, 'visible' | 'onCancel'> {
  status: LunaStatus
  config: Pick<Config, 'dataDir' | 'rpcAddress'>
  managedConfig: Pick<LunaManagedConfig, 'miningEnabled'>
  syncStatus?: SynchronizationStatus
}

export const StatusModal = ({
  status,
  config,
  managedConfig,
  syncStatus,
  ...props
}: StatusModalProps): JSX.Element => {
  const {networkTag} = BackendState.useContainer()

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
          <div className="title">Machine</div>
          <div className="info-item">
            <div>Platform:</div>
            <div className="info-value">{status.info.platform}</div>
          </div>
          <div className="info-item">
            <div>Platform Version:</div>
            <div className="info-value">{status.info.platformVersion}</div>
          </div>
          <div className="info-item">
            <div>CPU:</div>
            <div className="info-value">{status.info.cpu}</div>
          </div>
          <div className="info-item">
            <div>Memory:</div>
            <div className="info-value">{filesize(status.info.memory)}</div>
          </div>
          <div className="title">Luna</div>
          <div className="info-item">
            <div>Luna version:</div>
            <div className="info-value">{status.info.lunaVersion}</div>
          </div>
          <div className="info-item">
            <div>Luna main process ID:</div>
            <div className="info-value">{status.info.mainPid}</div>
          </div>
          <div className="info-item">
            <div>Luna renderer process ID:</div>
            <div className="info-value">{process.pid}</div>
          </div>
          <div className="info-item">
            <div>Luna local directory:</div>
            <div className="info-value">
              <CopyableLongText content={config.dataDir} />
            </div>
          </div>
        </div>
        <div>
          <div className="title">Midnight backend</div>
          <div className="info-item">
            <div>Network:</div>
            <div className="info-value">
              {isNone(networkTag) ? 'Loading' : NETWORK_CONSTANTS[networkTag.value].name}
            </div>
          </div>
          <div className="info-item">
            <div>Sonics params fetching:</div>
            <div className="info-value">{visibleStatus[status.fetchParams.status]}</div>
          </div>
          <div className="info-item">
            <div>Node status:</div>
            <div className="info-value">{visibleStatus[status.node.status]}</div>
          </div>
          <div className="info-item">
            <div>Node process ID:</div>
            <div className="info-value">{status.node.pid || '-'}</div>
          </div>
          <div className="info-item">
            <div>Wallet status:</div>
            <div className="info-value">{visibleStatus[status.wallet.status]}</div>
          </div>
          <div className="info-item">
            <div>Wallet process ID:</div>
            <div className="info-value">{status.wallet.pid || '-'}</div>
          </div>
          <div className="info-item">
            <div>Wallet RPC address:</div>
            <div className="info-value">
              <CopyableLongText content={config.rpcAddress} />
            </div>
          </div>
          <div className="info-item">
            <div>Mining enabled:</div>
            <div className="info-value">
              <span className={classnames('status', {success: managedConfig.miningEnabled})}>
                {managedConfig.miningEnabled ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
          <div className="info-item">
            <div>Mining status:</div>
            <div className="info-value">
              <MiningStatus />
            </div>
          </div>
          <div className="info-item">
            <div>Last DAG information:</div>
            <div className="info-value">
              <DisplayDagStatus dag={status.dag} />
            </div>
          </div>
          <div className="info-item">
            <div>Synchronization:</div>
            <div className="info-value">
              <DisplaySyncStatus syncStatus={syncStatus} />
            </div>
          </div>
          <div className="info-item">
            <div>Current block:</div>
            <div className="info-value">{syncStatus?.currentBlock || '-'}</div>
          </div>
          <div className="info-item">
            <div>Highest known block:</div>
            <div className="info-value">
              {(syncStatus?.mode === 'online' && syncStatus.highestKnownBlock) || '-'}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
