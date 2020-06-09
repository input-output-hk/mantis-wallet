import React from 'react'
import {EmptyProps} from 'antd/lib/empty'
import {BurnActions} from './BurnActions'
import {BurnActivity} from './BurnActivity'
import {ProofOfBurnState} from './pob-state'
import {useInterval} from '../common/hook-utils'
import {PobLayout} from './PobLayout'
import {RouterState} from '../router-state'
import {NoWallet} from '../wallets/NoWallet'
import {withStatusGuard, PropsWithWalletState} from '../common/wallet-status-guard'
import {LoadedState} from '../common/wallet-state'
import {PROVER_POLLING_RATE} from './pob-config'
import './BurnCentre.scss'

export const _BurnCentre = ({
  walletState,
}: PropsWithWalletState<EmptyProps, LoadedState>): JSX.Element => {
  const pobState = ProofOfBurnState.useContainer()
  const routerState = RouterState.useContainer()

  useInterval(pobState.refresh, PROVER_POLLING_RATE)

  return (
    <PobLayout title="Burn Centre">
      <BurnActions
        onBurnCoins={() => routerState.navigate('BURN_COINS')}
        transparentAccounts={walletState.transparentAccounts}
        {...pobState}
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
