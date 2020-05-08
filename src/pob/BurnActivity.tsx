import React, {useState} from 'react'
import _ from 'lodash/fp'
import {Icon} from 'antd'
import {BurnStatus, RealBurnStatus} from './pob-state'
import {BorderlessInput} from '../common/BorderlessInput'
import {BurnStatusDisplay} from './BurnStatusDisplay'
import {DialogError} from '../common/dialog/DialogError'
import {withStatusGuard, PropsWithWalletState} from '../common/wallet-status-guard'
import {LoadedState} from '../common/wallet-state'
import './BurnActivity.scss'

interface BurnActivityProps {
  burnStatuses: Record<string, BurnStatus>
}

export const _BurnActivity = ({
  burnStatuses,
  walletState,
}: PropsWithWalletState<BurnActivityProps, LoadedState>): JSX.Element => {
  const [searchTxId, setSearchTxId] = useState('')

  const [noBurnObserved, existingBurnStatuses]: Array<Array<[string, BurnStatus]>> = _.pipe(
    _.toPairs,
    _.partition(([, {lastStatuses}]: [string, BurnStatus]) => lastStatuses.length === 0),
  )(burnStatuses)

  const filteredStatuses = existingBurnStatuses
    .flatMap(([address, {lastStatuses, errorMessage}]) =>
      lastStatuses.map((lastStatus: RealBurnStatus) => ({
        address,
        errorMessage,
        burnStatus: lastStatus,
      })),
    )
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
        <BorderlessInput
          className="search"
          prefix={<Icon type="search" />}
          placeholder="Burn Tx ID"
          onChange={(e) => setSearchTxId(e.target.value)}
        />
      </div>
      {noBurnObserved.length > 0 &&
        noBurnObserved.map(([address, {errorMessage}]) => (
          <div className="burn-address-error" key={address}>
            <DialogError>
              {errorMessage && (
                <>
                  Gathering burn activity for {address} from the prover failed with the following
                  error:
                  <br />
                  {errorMessage}
                </>
              )}
              {!errorMessage && `No burn transactions observed for burn address ${address}.`}
            </DialogError>
          </div>
        ))}
      {filteredStatuses.length === 0 && (
        <div className="no-activity">No burn activity to show.</div>
      )}
      {filteredStatuses.length > 0 && (
        <>
          <div className="list-header">
            <div>Burn Address</div>
            <div>Burn Amount / CCY</div>
            <div>Midnight Transaction Id</div>
            <div className="last">Source Transaction Id</div>
          </div>
          <div>
            {filteredStatuses.map((status) => (
              <BurnStatusDisplay
                key={`${status.address}-${status.burnStatus.txid}`}
                syncStatus={walletState.syncStatus}
                {...status}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export const BurnActivity = withStatusGuard(_BurnActivity, 'LOADED')
