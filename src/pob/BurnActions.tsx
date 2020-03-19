import React, {useState} from 'react'
import {Button} from 'antd'
import {BurnBalance, BurnBalanceProps} from './BurnBalance'
import {WatchBurnModal} from './modals/WatchBurnModal'
import {ProofOfBurnState} from './pob-state'
import {config} from '../config/renderer'
import './BurnActions.scss'

interface BurnActionsProps {
  onBurnCoins?: () => void
  onRegisterAuction?: () => void
  burnBalances: Array<BurnBalanceProps & {address: string}>
}

export const BurnActions: React.FunctionComponent<BurnActionsProps> = ({
  onBurnCoins,
  onRegisterAuction,
  burnBalances,
}: BurnActionsProps) => {
  const pobState = ProofOfBurnState.useContainer()

  const {provers} = config

  const [showWatchBurnModal, setShowWatchBurnModal] = useState(false)

  return (
    <div className="BurnActions">
      <div className="toolbar">
        <div className="wallet">Wallet 01</div>
        <div>
          <Button type="primary" className="action" onClick={onBurnCoins}>
            Burn Coins
          </Button>
          <Button
            type="primary"
            className="action secondary"
            onClick={() => setShowWatchBurnModal(true)}
          >
            Watch Burn
          </Button>
          <Button type="primary" className="action secondary" onClick={onRegisterAuction}>
            Register for Auction
          </Button>
        </div>
      </div>
      {burnBalances.length === 0 && (
        <div className="no-balances">
          <span className="link" onClick={onBurnCoins}>
            You have no burns in progress, to start burn, click here.
          </span>
        </div>
      )}
      {burnBalances.length > 0 && (
        <div className="balances">
          <div className="scroller">
            {burnBalances.map((balance) => (
              <BurnBalance key={balance.address} {...balance} />
            ))}
          </div>
        </div>
      )}
      <WatchBurnModal
        visible={showWatchBurnModal}
        onCancel={(): void => setShowWatchBurnModal(false)}
        onWatchBurn={(proverAddress: string, burnAddress: string): void => {
          const prover = config.provers.find(({address}) => address === proverAddress)
          if (prover) pobState.addBurnWatcher(burnAddress, prover)
          setShowWatchBurnModal(false)
        }}
        provers={provers}
      />
    </div>
  )
}
