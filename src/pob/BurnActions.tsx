import React, {useState, FunctionComponent} from 'react'
import BigNumber from 'bignumber.js'
import {Button, Popover} from 'antd'
import _ from 'lodash/fp'
import {BurnBalanceDisplay} from './BurnBalanceDisplay'
import {AddBurnTxModal} from './modals/AddBurnTxModal'
import {ProofOfBurnData} from './pob-state'
import {ProverConfig} from '../config/type'
import {TransparentAccount} from '../common/wallet-state'
import {fillActionHandlers} from '../common/util'
import {CHAINS_TO_USE_IN_POB} from './pob-config'
import {prop} from '../shared/utils'
import {ChainId} from './chains'
import './BurnActions.scss'

interface BurnActionsProps
  extends Pick<ProofOfBurnData, 'burnAddresses' | 'provers' | 'addTx' | 'pendingBalances'> {
  onBurnCoins: () => void
  transparentAccounts: TransparentAccount[]
}

export const BurnActions: FunctionComponent<BurnActionsProps> = ({
  onBurnCoins,
  transparentAccounts,
  pendingBalances,
  burnAddresses,
  provers,
  addTx,
}: BurnActionsProps) => {
  const [showAddTxModal, setShowAddTxModal] = useState(false)

  const availableBalances = transparentAccounts.map(prop('midnightTokens')).reduce(
    _.mergeWith((a: BigNumber, b: BigNumber) => (a ? a.plus(b) : b)),
    {},
  ) as Partial<Record<ChainId, BigNumber>>

  const burnBalances = CHAINS_TO_USE_IN_POB.map((chain) => ({
    chain,
    available: availableBalances[chain.id] || new BigNumber(0),
    pending: pendingBalances[chain.id] || new BigNumber(0),
  })).filter(({available, pending}) => !available.isZero() || !pending.isZero())

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
        </div>
      </div>
      {burnBalances.length === 0 && (
        <div className="no-balances">
          <span className="link" {...fillActionHandlers(onBurnCoins, 'link')}>
            You have no burns in progress, to start burn, click here.
          </span>
        </div>
      )}
      {burnBalances.length > 0 && (
        <div className="balances">
          <div className="scroller">
            {burnBalances.map((balance) => (
              <BurnBalanceDisplay key={balance.chain.id} {...balance} />
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
