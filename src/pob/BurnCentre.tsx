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

const refreshRate = 2000

export const _BurnCentre = (): JSX.Element => {
  const pobState = ProofOfBurnState.useContainer()
  const routerState = RouterState.useContainer()

  useInterval(pobState.refresh, refreshRate)

  return (
    <PobLayout title="Burn Centre">
      <BurnActions onBurnCoins={() => routerState.navigate('BURN_COINS')} {...pobState} />
      <BurnActivity burnStatuses={pobState.burnStatuses} />
    </PobLayout>
  )
}

export const BurnCentre = withStatusGuard(_BurnCentre, 'LOADED', () => (
  <PobLayout title="Burn Centre">
    <NoWallet />
  </PobLayout>
))
