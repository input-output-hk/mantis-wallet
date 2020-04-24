import React, {useState} from 'react'
import {Button, Popover} from 'antd'
import {BurnBalanceDisplay} from './BurnBalanceDisplay'
import {AddBurnTxModal} from './modals/AddBurnTxModal'
import {ProofOfBurnState, BurnBalance, BurnAddressInfo} from './pob-state'
import {ProverConfig} from '../config/type'
import './BurnActions.scss'

interface BurnActionsProps {
  onBurnCoins?: () => void
  onRegisterAuction?: () => void
  burnBalances: BurnBalance[]
}

export const BurnActions: React.FunctionComponent<BurnActionsProps> = ({
  onBurnCoins,
  onRegisterAuction,
  burnBalances,
}: BurnActionsProps) => {
  const pobState = ProofOfBurnState.useContainer()
  const provers = pobState.provers

  const [showAddTxModal, setShowAddTxModal] = useState(false)

  return (
    <div className="BurnActions">
      <div className="toolbar">
        <div className="wallet">Wallet 01</div>
        <div>
          <Button type="primary" className="action" onClick={onBurnCoins}>
            Burn Coins
          </Button>
          <Popover content="Enter burn transaction manually">
            <Button type="primary" className="action" onClick={() => setShowAddTxModal(true)}>
              Manual Burn
            </Button>
          </Popover>
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
              <BurnBalanceDisplay key={balance.chain.id} balance={balance} />
            ))}
          </div>
        </div>
      )}
      <AddBurnTxModal
        visible={showAddTxModal}
        onCancel={(): void => setShowAddTxModal(false)}
        onAddTx={async (
          prover: ProverConfig,
          burnTx: string,
          burnAddressInfo: BurnAddressInfo,
        ): Promise<void> => {
          await pobState.addTx(prover, burnTx, burnAddressInfo)
          setShowAddTxModal(false)
        }}
        provers={provers}
        burnAddresses={pobState.burnAddresses}
      />
    </div>
  )
}
