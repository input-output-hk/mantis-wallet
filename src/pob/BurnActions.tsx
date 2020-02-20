import React from 'react'
import {Button, message} from 'antd'
import {BurnBalance, BurnBalanceProps} from './BurnBalance'
import './BurnActions.scss'
import {WalletState} from '../common/wallet-state'

interface BurnActionsProps {
  onBurnCoins?: () => void
  onRegisterAuction?: () => void
  onWatchBurn?: () => void
  burnBalances: Array<BurnBalanceProps & {address: string}>
}

export const BurnActions: React.FunctionComponent<BurnActionsProps> = ({
  onBurnCoins,
  onRegisterAuction,
  onWatchBurn,
  burnBalances,
}: BurnActionsProps) => {
  const walletState = WalletState.useContainer()

  return (
    <div className="BurnActions">
      <div className="toolbar">
        <div className="wallet">Wallet 01</div>
        <div>
          <Button type="primary" className="action" onClick={onBurnCoins}>
            Burn Coins
          </Button>
          <Button type="primary" className="action secondary" onClick={onWatchBurn}>
            Watch Burn
          </Button>
          <Button type="primary" className="action secondary" onClick={onRegisterAuction}>
            Register for Auction
          </Button>
          <Button
            className="action"
            onClick={async (): Promise<void> => {
              if (walletState.walletStatus === 'LOADED') {
                await walletState.generateNewAddress()
                message.info('New transparent address generated')
              }
            }}
            disabled={walletState.walletStatus !== 'LOADED'}
          >
            New Transparent Address
          </Button>
        </div>
      </div>
      {burnBalances.length === 0 && (
        <div className="no-balances">
          You have no burns in progress, to start burn,{' '}
          <span className="link" onClick={onBurnCoins}>
            go here.
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
    </div>
  )
}
