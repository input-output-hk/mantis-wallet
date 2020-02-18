import React, {useState} from 'react'
import {Button, message} from 'antd'
import {config} from '../config/renderer'
import {useInterval} from '../common/hook-utils'
import {ProofOfBurnState} from './pob-state'
import {WalletState} from '../common/wallet-state'
import {CreateBurnModal} from './modals/CreateBurnModal'
import {WatchBurnModal} from './modals/WatchBurnModal'
import './ProofOfBurn.scss'

export const ProofOfBurn = (): JSX.Element => {
  const {addBurnWatcher, burnStatuses, refreshBurnStatus} = ProofOfBurnState.useContainer()
  const walletState = WalletState.useContainer()

  const transparentAddresses =
    walletState.walletStatus === 'LOADED'
      ? walletState.transparentAddresses.map(({address}) => address)
      : []
  const {provers} = config

  useInterval(refreshBurnStatus, 2000)

  const [showCreateBurnModal, setShowCreateBurnModal] = useState(false)
  const [showWatchBurnModal, setShowWatchBurnModal] = useState(false)

  if (provers.length === 0) {
    return (
      <div className="ProofOfBurn">
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
    <div className="ProofOfBurn">
      <div className="title">Burn Activity</div>
      <div className="actions">
        <Button onClick={(): void => setShowCreateBurnModal(true)}>Create Burn Address</Button>
        &nbsp;
        <Button onClick={(): void => setShowWatchBurnModal(true)}>Watch Burn Address</Button>
        &nbsp;
        <Button onClick={refreshBurnStatus}>Refresh</Button>
        &nbsp;
        <Button
          onClick={async (): Promise<void> => {
            if (walletState.walletStatus === 'LOADED') {
              await walletState.generateNewAddress()
              message.info('New transparent address generated')
            }
          }}
          disabled={walletState.walletStatus !== 'LOADED'}
        >
          Generate New Transparent Address
        </Button>
        <CreateBurnModal
          provers={provers}
          transparentAddresses={transparentAddresses}
          visible={showCreateBurnModal}
          errorMessage={createErrorMessage}
          onCancel={() => setShowCreateBurnModal(false)}
          onCreateBurn={async (
            proverAddress,
            transparentAddress,
            chainId,
            reward,
            autoConversion,
          ): Promise<void> => {
            const prover = provers.find(({address}) => address === proverAddress)
            if (walletState.walletStatus !== 'LOADED') {
              message.error(
                `Wallet is ${walletState.walletStatus}, it should be LOADED to create a burn address`,
              )
            } else if (!prover) {
              message.error('Unknown prover')
            } else {
              try {
                const burnAddress = await walletState.getBurnAddress(
                  transparentAddress,
                  chainId,
                  reward,
                  autoConversion,
                )
                addBurnWatcher(burnAddress, prover)
                setShowCreateBurnModal(false)
              } catch (e) {
                message.error(e.message)
              }
            }
          }}
        />
        <WatchBurnModal
          visible={showWatchBurnModal}
          onCancel={(): void => setShowWatchBurnModal(false)}
          onWatchBurn={(proverAddress: string, burnAddress: string): void => {
            const prover = config.provers.find(({address}) => address === proverAddress)
            if (prover) addBurnWatcher(burnAddress, prover)
            setShowWatchBurnModal(false)
          }}
          provers={provers}
        />
      </div>
      <div className="list">
        {burnStatuses.map(([burnWatcher, burnStatus]) => (
          <div
            className="burn-watcher"
            key={`${burnWatcher.burnAddress}-${burnWatcher.prover.address}`}
          >
            <div className="burn-address">
              {burnWatcher.burnAddress} ({burnWatcher.prover.name} - {burnWatcher.prover.address})
            </div>
            <pre>{JSON.stringify(burnStatus, undefined, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  )
}
