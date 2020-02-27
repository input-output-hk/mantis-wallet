import React from 'react'
import {BurnWatcher, BurnStatus} from './pob-state'
import './BurnActivity.scss'

interface BurnActivityProps {
  burnStatuses: Array<[BurnWatcher, BurnStatus]>
}

export const BurnActivity = ({burnStatuses}: BurnActivityProps): JSX.Element => (
  <div className="BurnActivity">
    <div className="title">Burn Activity</div>
    <div className="list">
      {burnStatuses.map(([burnWatcher, burnStatus]) => (
        <div
          className="burn-watcher"
          key={`${burnWatcher.burnAddress}-${burnWatcher.prover.address}`}
        >
          <div className="burn-address">
            {burnWatcher.burnAddress} ({burnWatcher.prover.name} - {burnWatcher.prover.address})
          </div>
          <pre>{JSON.stringify(burnStatus, undefined, 2)}</pre>
        </div>
      ))}
    </div>
  </div>
)
