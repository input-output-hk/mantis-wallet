import React, {useState} from 'react'
import _ from 'lodash/fp'
import {Icon} from 'antd'
import {BurnStatus} from './pob-state'
import {BorderlessInput} from '../common/BorderlessInput'
import {BurnStatusDisplay} from './BurnStatusDisplay'
import './BurnActivity.scss'

interface BurnActivityProps {
  burnStatuses: Record<string, BurnStatus>
}

export const BurnActivity: React.FunctionComponent<BurnActivityProps> = ({
  burnStatuses,
}: BurnActivityProps) => {
  const [searchTxId, setSearchTxId] = useState('')

  const filteredStatuses = _.toPairs(burnStatuses).filter(
    ([
      ,
      {
        lastStatus: {txid, midnight_txid: midnightTxid},
      },
    ]) => (txid || '').includes(searchTxId) || (midnightTxid || '').includes(searchTxId),
  )
  return (
    <div className="BurnActivity">
      <div className="toolbar">
        <div className="title">Burn Activity</div>
        <div className="line"></div>
        <BorderlessInput
          className="search"
          prefix={<Icon type="search" />}
          placeholder="Burn Tx ID"
          onChange={(e) => setSearchTxId(e.target.value)}
        />
      </div>
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
            {filteredStatuses.map(([address, burnStatus]) => (
              <BurnStatusDisplay key={address} address={address} status={burnStatus} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
