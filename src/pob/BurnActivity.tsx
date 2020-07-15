import React, {useState, useEffect} from 'react'
import _ from 'lodash/fp'
import classnames from 'classnames'
import {Popover, Switch} from 'antd'
import {SearchOutlined, EyeOutlined, EyeInvisibleOutlined, LoadingOutlined} from '@ant-design/icons'
import {BurnStatus, RealBurnStatus, ProofOfBurnData, BurnWatcher} from './pob-state'
import {BorderlessInput} from '../common/BorderlessInput'
import {BurnStatusDisplay} from './BurnStatusDisplay'
import {withStatusGuard, PropsWithWalletState} from '../common/wallet-status-guard'
import {LoadedState} from '../common/wallet-state'
import {SettingsState} from '../settings-state'
import './BurnActivity.scss'

type BurnActivityProps = Pick<
  ProofOfBurnData,
  'burnAddresses' | 'burnStatuses' | 'hideBurnWatcher' | 'hideBurnProcess'
>

const BurnAddressError = ({
  burnWatcher,
  errorMessage,
  isHidden,
  hideBurnWatcher,
}: {
  burnWatcher: BurnWatcher
  isHidden: boolean
  errorMessage?: string
  hideBurnWatcher: ProofOfBurnData['hideBurnWatcher']
}): JSX.Element => {
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
          content={isHidden ? 'Unhide this burn address' : 'Hide this burn address'}
          placement="topRight"
          align={{offset: [13, 0]}}
        >
          {hidingProgress === 'persisted' ? (
            <span
              className="toggle-hide"
              onClick={() => {
                setHidingProgress({to: !isHidden})
                hideBurnWatcher(burnWatcher, !isHidden)
              }}
            >
              {isHidden ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            </span>
          ) : (
            <LoadingOutlined spin />
          )}
        </Popover>
      </div>
      <div className="burn-address-error">
        {errorMessage && (
          <>
            Gathering burn activity for {burnAddress} from prover &#34;{prover.name}&#34; failed
            with the following error:
            <br />
            {errorMessage}
          </>
        )}
        {!errorMessage &&
          `No burn transactions observed for burn address ${burnAddress} by prover "${prover.name}".`}
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
  } = SettingsState.useContainer()

  const [noBurnObserved, existingBurnStatuses]: BurnStatus[][] = _.partition(
    ({lastStatuses}: BurnStatus) => lastStatuses.length === 0,
  )(burnStatuses)

  const filteredStatuses = existingBurnStatuses
    .flatMap(({lastStatuses, burnWatcher, errorMessage}) =>
      lastStatuses.map((lastStatus: RealBurnStatus) => ({
        burnWatcher,
        burnAddressInfo: burnAddresses[burnWatcher.burnAddress],
        errorMessage,
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
        <div className="main-title">Burn Activity</div>
        <div className="line"></div>
        <div className="search">
          <SearchOutlined />
          {
            <BorderlessInput
              className="search-input"
              aria-label="Search for Burn Tx ID"
              placeholder="Burn Tx ID"
              onChange={(e) => setSearchTxId(e.target.value)}
            />
          }
        </div>
        <div className="toggle-hidden">
          <span className="toggle-hidden-label" onClick={() => setHiddenVisible(!areHiddenVisible)}>
            Show hidden
          </span>
          <Switch title="Show hidden" checked={areHiddenVisible} onChange={setHiddenVisible} />
        </div>
      </div>
      {noBurnObserved
        .filter(({isHidden}) => areHiddenVisible || !isHidden)
        .map(({burnWatcher, errorMessage, isHidden}) => (
          <BurnAddressError
            burnWatcher={burnWatcher}
            errorMessage={errorMessage}
            isHidden={isHidden}
            hideBurnWatcher={hideBurnWatcher}
            key={`${burnWatcher.burnAddress} ${burnWatcher.prover.address}`}
          />
        ))}
      {filteredStatuses.length === 0 && (
        <div className="no-activity">No burn activity to show.</div>
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
