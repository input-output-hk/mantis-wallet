import React from 'react'
import {BurnActions} from './BurnActions'
import {BurnActivity} from './BurnActivity'
import {ProofOfBurnState} from './pob-state'
import {useInterval} from '../common/hook-utils'
import {PobLayout} from './PobLayout'
import {RouterState} from '../router-state'
import {NoWallet} from '../wallets/NoWallet'
import {withStatusGuard} from '../common/wallet-status-guard'
import './BurnCentre.scss'

export const _BurnCentre = (): JSX.Element => {
  const pobState = ProofOfBurnState.useContainer()
  const routerState = RouterState.useContainer()

  useInterval(pobState.refresh, 5000)

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

export const BurnCentre = withStatusGuard(_BurnCentre, 'LOADED', () => (
  <PobLayout title="Burn Centre">
    <NoWallet />
  </PobLayout>
))
