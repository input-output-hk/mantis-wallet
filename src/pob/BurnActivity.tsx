import React, {useState, useEffect} from 'react'
import _ from 'lodash/fp'
import classnames from 'classnames'
import {Popover, Switch} from 'antd'
import {SearchOutlined, EyeOutlined, EyeInvisibleOutlined, LoadingOutlined} from '@ant-design/icons'
import {BurnStatus, RealBurnStatus, ProofOfBurnData, BurnWatcher} from './pob-state'
import {fillActionHandlers} from '../common/util'
import {BorderlessInput} from '../common/BorderlessInput'
import {BurnStatusDisplay} from './BurnStatusDisplay'
import {withStatusGuard, PropsWithWalletState} from '../common/wallet-status-guard'
import {LoadedState} from '../common/wallet-state'
import {SettingsState, useTranslation} from '../settings-state'
import {Trans} from '../common/Trans'
import './BurnActivity.scss'

type BurnActivityProps = Pick<
  ProofOfBurnData,
  'burnAddresses' | 'burnStatuses' | 'hideBurnWatcher' | 'hideBurnProcess'
>

const BurnAddressError = ({
  burnWatcher,
  error,
  isHidden,
  hideBurnWatcher,
}: {
  burnWatcher: BurnWatcher
  isHidden: boolean
  error?: Error
  hideBurnWatcher: ProofOfBurnData['hideBurnWatcher']
}): JSX.Element => {
  const {translateError} = useTranslation()
  const [hidingProgress, setHidingProgress] = useState<{to: boolean} | 'persisted'>('persisted')
  const {burnAddress, prover} = burnWatcher

  useEffect(() => {
    if (hidingProgress !== 'persisted' && hidingProgress.to === isHidden) {
      setHidingProgress('persisted')
    }
  }, [isHidden])

  return (
    <div className={classnames('burn-address', {hidden: isHidden})}>
      <div className={classnames('actions', {forceDisplay: hidingProgress !== 'persisted'})}>
        <Popover
          content={
            isHidden ? (
              <Trans k={['proofOfBurn', 'message', 'unhideThisBurnAddress']} />
            ) : (
              <Trans k={['proofOfBurn', 'message', 'hideThisBurnAddress']} />
            )
          }
          placement="topRight"
          align={{offset: [13, 0]}}
        >
          {hidingProgress === 'persisted' ? (
            <span
              className="toggle-hide"
              {...fillActionHandlers(() => {
                setHidingProgress({to: !isHidden})
                hideBurnWatcher(burnWatcher, !isHidden)
              })}
            >
              {isHidden ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            </span>
          ) : (
            <LoadingOutlined spin />
          )}
        </Popover>
      </div>
      <div className="burn-address-error">
        {error && (
          <Trans
            k={['proofOfBurn', 'error', 'gatheringBurnActivityFromProverFailed']}
            values={{burnAddress, proverName: prover.name, errorMessage: translateError(error)}}
          />
        )}
        {!error && (
          <Trans
            k={['proofOfBurn', 'error', 'noBurnsObserved']}
            values={{burnAddress, proverName: prover.name}}
          />
        )}
      </div>
    </div>
  )
}

export const _BurnActivity = ({
  burnStatuses,
  burnAddresses,
  hideBurnWatcher,
  hideBurnProcess,
  walletState,
}: PropsWithWalletState<BurnActivityProps, LoadedState>): JSX.Element => {
  const [searchTxId, setSearchTxId] = useState('')

  const {
    areHiddenBurnsVisible: areHiddenVisible,
    setHiddenBurnsVisible: setHiddenVisible,
    translation: {t},
  } = SettingsState.useContainer()

  const [noBurnObserved, existingBurnStatuses]: BurnStatus[][] = _.partition(
    ({lastStatuses}: BurnStatus) => lastStatuses.length === 0,
  )(burnStatuses)

  const filteredStatuses = existingBurnStatuses
    .flatMap(({lastStatuses, burnWatcher, error}) =>
      lastStatuses.map((lastStatus: RealBurnStatus) => ({
        burnWatcher,
        burnAddressInfo: burnAddresses[burnWatcher.burnAddress],
        error,
        burnStatus: lastStatus,
      })),
    )
    .filter(({burnStatus: {isHidden}}) => areHiddenVisible || !isHidden)
    .filter(
      ({burnStatus}) =>
        (burnStatus.txid || '').includes(searchTxId) ||
        (burnStatus.commitment_txid || '').includes(searchTxId) ||
        (burnStatus.redeem_txid || '').includes(searchTxId),
    )

  return (
    <div className="BurnActivity">
      <div className="toolbar">
        <div className="main-title">
          <Trans k={['proofOfBurn', 'title', 'burnActivity']} />
        </div>
        <div className="line"></div>
        <div className="search">
          <SearchOutlined />
          {
            <BorderlessInput
              className="search-input"
              aria-label={t(['proofOfBurn', 'label', 'searchForBurnTx'])}
              placeholder={t(['proofOfBurn', 'message', 'searchByTxIdFieldPlaceholder'])}
              onChange={(e) => setSearchTxId(e.target.value)}
            />
          }
        </div>
        <div className="toggle-hidden">
          <span
            className="toggle-hidden-label"
            {...fillActionHandlers(() => setHiddenVisible(!areHiddenVisible))}
          >
            <Trans k={['proofOfBurn', 'button', 'showHidden']} />
          </span>
          <Switch
            title={t(['proofOfBurn', 'button', 'showHidden'])}
            checked={areHiddenVisible}
            onChange={setHiddenVisible}
          />
        </div>
      </div>
      {noBurnObserved
        .filter(({isHidden}) => areHiddenVisible || !isHidden)
        .map(({burnWatcher, error, isHidden}) => (
          <BurnAddressError
            burnWatcher={burnWatcher}
            error={error}
            isHidden={isHidden}
            hideBurnWatcher={hideBurnWatcher}
            key={`${burnWatcher.burnAddress} ${burnWatcher.prover.address}`}
          />
        ))}
      {filteredStatuses.length === 0 && (
        <div className="no-activity">
          <Trans k={['proofOfBurn', 'message', 'noBurnActivity']} />
        </div>
      )}
      {filteredStatuses.length > 0 && (
        <div>
          {filteredStatuses.map((status) => (
            <BurnStatusDisplay
              key={`${status.burnWatcher.burnAddress} ${status.burnWatcher.prover.address} ${status.burnStatus.txid}`}
              syncStatus={walletState.syncStatus}
              hideBurnProcess={hideBurnProcess}
              {...status}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export const BurnActivity = withStatusGuard(_BurnActivity, 'LOADED')
