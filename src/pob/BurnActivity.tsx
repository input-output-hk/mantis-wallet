import React, {useState} from 'react'
import _ from 'lodash/fp'
import {SearchOutlined} from '@ant-design/icons'
import {BurnStatus, RealBurnStatus, ProofOfBurnData} from './pob-state'
import {BorderlessInput} from '../common/BorderlessInput'
import {BurnStatusDisplay} from './BurnStatusDisplay'
import {withStatusGuard, PropsWithWalletState} from '../common/wallet-status-guard'
import {LoadedState} from '../common/wallet-state'
import './BurnActivity.scss'

type BurnActivityProps = Pick<ProofOfBurnData, 'burnAddresses' | 'burnStatuses'>

export const _BurnActivity = ({
  burnStatuses,
  burnAddresses,
  walletState,
}: PropsWithWalletState<BurnActivityProps, LoadedState>): JSX.Element => {
  const [searchTxId, setSearchTxId] = useState('')

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
              placeholder="Burn Tx ID"
              onChange={(e) => setSearchTxId(e.target.value)}
            />
          }
        </div>
      </div>
      {noBurnObserved.length > 0 &&
        noBurnObserved.map(({burnWatcher: {burnAddress, prover: {name}}, errorMessage}) => (
          <div className="burn-address-error" key={burnAddress}>
            {errorMessage && (
              <>
                Gathering burn activity for {burnAddress} from prover &#34;{name}&#34; failed
                with the following error:
                <br />
                {errorMessage}
              </>
            )}
            {!errorMessage &&
              `No burn transactions observed for burn address ${burnAddress} by prover "${name}".`}
          </div>
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
              {...status}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export const BurnActivity = withStatusGuard(_BurnActivity, 'LOADED')
