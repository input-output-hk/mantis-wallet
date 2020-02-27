import React, {useState} from 'react'
import {config} from '../config/renderer'
import {useInterval} from '../common/hook-utils'
import {BurnActions} from './BurnActions'
import {BurnActivity} from './BurnActivity'
import {ProofOfBurnState} from './pob-state'
import {WalletState} from '../common/wallet-state'
import {CreateBurnModal} from './modals/CreateBurnModal'
import {WatchBurnModal} from './modals/WatchBurnModal'
import './BurnCentre.scss'

export const BurnCentre = (): JSX.Element => {
  const pobState = ProofOfBurnState.useContainer()
  const walletState = WalletState.useContainer()

  const transparentAddresses =
    walletState.walletStatus === 'LOADED'
      ? walletState.transparentAddresses.map(({address}) => address)
      : []
  const {provers} = config

  useInterval(pobState.refreshBurnStatus, 2000)

  const [showCreateBurnModal, setShowCreateBurnModal] = useState(false)
  const [showWatchBurnModal, setShowWatchBurnModal] = useState(false)

  if (provers.length === 0) {
    return (
      <div className="BurnCentre">
        <div className="title">Burn Activity</div>
        <div>No provers configured, cannot show activity</div>
      </div>
    )
  }

  const createErrorMessage =
    walletState.walletStatus === 'LOADED' && transparentAddresses.length > 0
      ? ''
      : 'Wallet should be loaded and there must be available transparent addresses.'

  return (
    <div className="BurnCentre">
      <div className="header">
        <div className="title">Burn Centre</div>
        <div className="more">
          <span className="link">More About the Proof of Burn</span>
        </div>
      </div>
      <BurnActions
        burnBalances={[]}
        onBurnCoins={(): void => setShowCreateBurnModal(true)}
        onWatchBurn={(): void => setShowWatchBurnModal(true)}
      />
      <BurnActivity burnStatuses={pobState.burnStatuses} />
      <CreateBurnModal
        provers={provers}
        transparentAddresses={transparentAddresses}
        visible={showCreateBurnModal}
        errorMessage={createErrorMessage}
        onCancel={() => setShowCreateBurnModal(false)}
        onCreateBurn={async (
          prover,
          transparentAddress,
          chain,
          reward,
          autoConversion,
        ): Promise<void> => {
          if (walletState.walletStatus === 'LOADED') {
            const burnAddress = await walletState.getBurnAddress(
              transparentAddress,
              chain,
              reward,
              autoConversion,
            )
            await pobState.observeBurnAddress(
              burnAddress,
              prover,
              transparentAddress,
              chain,
              reward,
              autoConversion,
            )
            setShowCreateBurnModal(false)
          }
        }}
      />
      <WatchBurnModal
        visible={showWatchBurnModal}
        onCancel={(): void => setShowWatchBurnModal(false)}
        onWatchBurn={(proverAddress: string, burnAddress: string): void => {
          const prover = config.provers.find(({address}) => address === proverAddress)
          if (prover) pobState.addBurnWatcher(burnAddress, prover)
          setShowWatchBurnModal(false)
        }}
        provers={provers}
      />
    </div>
  )
}
