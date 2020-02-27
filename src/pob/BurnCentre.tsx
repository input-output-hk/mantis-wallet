import React from 'react'
import {BurnActions} from './BurnActions'
import {BurnActivity} from './BurnActivity'
import {ProofOfBurnState} from './pob-state'
import {useInterval} from '../common/hook-utils'
import {PobLayout} from './PobLayout'
import {RouterState} from '../router-state'
import './BurnCentre.scss'

export const BurnCentre = (): JSX.Element => {
  const pobState = ProofOfBurnState.useContainer()
  const routerState = RouterState.useContainer()

  useInterval(pobState.refreshBurnStatus, 2000)

  return (
    <PobLayout title="Burn Centre">
      <BurnActions burnBalances={[]} onBurnCoins={() => routerState.navigate('BURN_COINS')} />
      <BurnActivity burnStatuses={pobState.burnStatuses} />
    </PobLayout>
  )
}
