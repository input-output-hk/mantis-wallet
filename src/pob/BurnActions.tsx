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
import {CHAINS_TO_USE_IN_POB, MIDNIGHT_TOKEN_CONTRACTS} from './pob-config'
import {prop} from '../shared/utils'
import {Trans} from '../common/Trans'
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

  const availableBalances = _.pipe(
    _.map(prop<TransparentAccount, 'tokens'>('tokens')),
    _.map(_.pick(Object.values(MIDNIGHT_TOKEN_CONTRACTS))),
    _.reduce(
      _.mergeWith((a: BigNumber, b: BigNumber) => (a ? a.plus(b) : b)),
      {},
    ),
  )(transparentAccounts) as Record<string, BigNumber>

  const burnBalances = CHAINS_TO_USE_IN_POB.map((chain) => ({
    chain,
    available: availableBalances[MIDNIGHT_TOKEN_CONTRACTS[chain.id]] || new BigNumber(0),
    pending: pendingBalances[chain.id] || new BigNumber(0),
  })).filter(({available, pending}) => !available.isZero() || !pending.isZero())

  return (
    <div className="BurnActions">
      <div className="toolbar">
        <div>
          {!_.isEmpty(burnAddresses) && (
            <Popover content={<Trans k={['proofOfBurn', 'message', 'manualBurnDescription']} />}>
              <Button type="primary" className="action" onClick={() => setShowAddTxModal(true)}>
                <Trans k={['proofOfBurn', 'button', 'manualBurn']} />
              </Button>
            </Popover>
          )}
          <Button type="primary" className="action" onClick={onBurnCoins}>
            <Trans k={['proofOfBurn', 'button', 'burnCoins']} />
          </Button>
        </div>
      </div>
      {burnBalances.length === 0 && (
        <div className="no-balances">
          <span className="link" {...fillActionHandlers(onBurnCoins, 'link')}>
            <Trans k={['proofOfBurn', 'message', 'noBurnsInProgress']} />
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
