import React, {useState} from 'react'
import {Button, Popover} from 'antd'
import _ from 'lodash'
import {BurnBalanceDisplay} from './BurnBalanceDisplay'
import {AddBurnTxModal} from './modals/AddBurnTxModal'
import {ProofOfBurnData} from './pob-state'
import {ProverConfig} from '../config/type'
import './BurnActions.scss'

interface BurnActionsProps
  extends Pick<ProofOfBurnData, 'burnBalances' | 'burnAddresses' | 'provers' | 'addTx'> {
  onBurnCoins?: () => void
  onRegisterAuction?: () => void
}

export const BurnActions: React.FunctionComponent<BurnActionsProps> = ({
  onBurnCoins,
  onRegisterAuction,
  burnBalances,
  burnAddresses,
  provers,
  addTx,
}: BurnActionsProps) => {
  const [showAddTxModal, setShowAddTxModal] = useState(false)

  return (
    <div className="BurnActions">
      <div className="toolbar">
        <div>
          {!_.isEmpty(burnAddresses) && (
            <Popover content="Enter burn transaction manually">
              <Button type="primary" className="action" onClick={() => setShowAddTxModal(true)}>
                Manual Burn
              </Button>
            </Popover>
          )}
          <Button type="primary" className="action" onClick={onBurnCoins}>
            Burn Coins
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
          burnAddress: string,
        ): Promise<void> => {
          await addTx(prover, burnTx, burnAddress)
          setShowAddTxModal(false)
        }}
        provers={provers}
        burnAddresses={burnAddresses}
      />
    </div>
  )
}
