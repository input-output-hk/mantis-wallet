import React, {useState} from 'react'
import {Button, message} from 'antd'
import {config} from '../config/renderer'
import {useInterval} from '../common/hook-utils'
import {ProofOfBurnState} from './pob-state'
import {WalletState} from '../common/wallet-state'
import {CreateBurnModal} from './modals/CreateBurnModal'
import {WatchBurnModal} from './modals/WatchBurnModal'
import {ChainName} from './api/prover'
import './ProofOfBurn.scss'

const CHAIN_BY_ID: ChainName[] = ['BTC_MAINNET', 'BTC_TESTNET', 'ETH_MAINNET', 'ETH_TESTNET']

export const ProofOfBurn = (): JSX.Element => {
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
        <Button onClick={pobState.refreshBurnStatus}>Refresh</Button>
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
                const burnAddressFromWallet = await walletState.getBurnAddress(
                  transparentAddress,
                  chainId,
                  reward,
                  autoConversion,
                )
                const burnAddressFromProver = await pobState.getBurnAddress(
                  prover,
                  transparentAddress,
                  CHAIN_BY_ID[chainId],
                  reward,
                  autoConversion,
                )
                if (burnAddressFromWallet !== burnAddressFromProver) {
                  message.error(
                    `Something went wrong, wallet and prover generated different burn-addresses: ${burnAddressFromWallet} vs ${burnAddressFromProver}`,
                  )
                } else {
                  pobState.addBurnWatcher(burnAddressFromWallet, prover)
                  setShowCreateBurnModal(false)
                }
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
            if (prover) pobState.addBurnWatcher(burnAddress, prover)
            setShowWatchBurnModal(false)
          }}
          provers={provers}
        />
      </div>
      <div className="list">
        {pobState.burnStatuses.map(([burnWatcher, burnStatus]) => (
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
