import React from 'react'
import {BurnActions} from './BurnActions'
import {BurnActivity} from './BurnActivity'
import {ProofOfBurnState} from './pob-state'
import {useInterval} from '../common/hook-utils'
import {PobLayout} from './PobLayout'
import {RouterState} from '../router-state'
import {WalletState} from '../common/wallet-state'
import {NoWallet} from '../wallets/NoWallet'
import './BurnCentre.scss'

export const BurnCentre = (): JSX.Element => {
  const pobState = ProofOfBurnState.useContainer()
  const routerState = RouterState.useContainer()
  const walletState = WalletState.useContainer()

  useInterval(pobState.refresh, 5000)

  if (walletState.walletStatus !== 'LOADED') {
    return (
      <PobLayout title="Burn Centre">
        <NoWallet />
      </PobLayout>
    )
  }

  return (
    <PobLayout title="Burn Centre">
      <BurnActions
        burnBalances={pobState.burnBalances}
        onBurnCoins={() => routerState.navigate('BURN_COINS')}
      />
      <BurnActivity burnStatuses={pobState.burnStatuses} />
    </PobLayout>
  )
}
