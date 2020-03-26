import React, {useState} from 'react'
import {EmptyProps} from 'antd/lib/empty'
import {PobLayout} from './PobLayout'
import {RouterState} from '../router-state'
import {LoadedState} from '../common/wallet-state'
import {BurnCoinsTransparentAddress} from './burn-coins/BurnCoinsTransparentAddress'
import {BurnCoinsChooseToken} from './burn-coins/BurnCoinsChooseToken'
import {Chain, CHAINS} from './chains'
import {BurnCoinsGenerateAddress} from './burn-coins/BurnCoinsGenerateAddress'
import {config} from '../config/renderer'
import {ProofOfBurnState} from './pob-state'
import {BurnCoinsShowAddress} from './burn-coins/BurnCoinsShowAddress'
import {PropsWithWalletState, withStatusGuard} from '../common/wallet-status-guard'

interface ChooseToken {
  step: 'CHOOSE_TOKEN'
}

interface GenerateBurn {
  step: 'GENERATE_BURN_ADDRESS'
  chain: Chain
}

interface ShowAddress {
  step: 'SHOW_ADDRESS'
  chain: Chain
  burnAddress: string
}

type BurnCoinsState = ChooseToken | GenerateBurn | ShowAddress

const CHAINS_TO_USE: Chain[] = [CHAINS.BTC_TESTNET, CHAINS.ETH_TESTNET]
const AUTO_DUST_CONVERSION = false

const _BurnCoins = ({walletState}: PropsWithWalletState<EmptyProps, LoadedState>): JSX.Element => {
  const pobState = ProofOfBurnState.useContainer()
  const routerState = RouterState.useContainer()

  const [burnState, setBurnState] = useState<BurnCoinsState>({step: 'CHOOSE_TOKEN'})

  const cancel = (): void => routerState.navigate('BURN_CENTRE')

  if (walletState.transparentAddresses.length === 0) {
    const generateTransparentAddress = (): Promise<void> => walletState.generateNewAddress()

    return (
      <PobLayout title="Burn Coins">
        <BurnCoinsTransparentAddress
          cancel={cancel}
          generateTransparentAddress={generateTransparentAddress}
        />
      </PobLayout>
    )
  }

  switch (burnState.step) {
    case 'CHOOSE_TOKEN':
      return (
        <PobLayout title="Token Burn">
          <BurnCoinsChooseToken
            chains={CHAINS_TO_USE}
            chooseChain={(chain) => {
              setBurnState({
                step: 'GENERATE_BURN_ADDRESS',
                chain,
              })
            }}
          />
        </PobLayout>
      )
    case 'GENERATE_BURN_ADDRESS': {
      const {chain} = burnState
      return (
        <PobLayout title={`Send ${chain.name}`}>
          <BurnCoinsGenerateAddress
            chain={chain}
            provers={config.provers}
            transparentAddresses={walletState.transparentAddresses.map(({address}) => address)}
            cancel={cancel}
            generateBurnAddress={async (prover, transparentAddress, fee): Promise<void> => {
              const burnAddress = await walletState.getBurnAddress(
                transparentAddress,
                chain,
                fee,
                AUTO_DUST_CONVERSION,
              )
              await pobState.observeBurnAddress(
                burnAddress,
                prover,
                transparentAddress,
                chain,
                fee,
                AUTO_DUST_CONVERSION,
              )
              setBurnState({
                step: 'SHOW_ADDRESS',
                chain,
                burnAddress,
              })
            }}
          />
        </PobLayout>
      )
    }
    case 'SHOW_ADDRESS': {
      const {chain, burnAddress} = burnState
      return (
        <PobLayout title="Burn Address">
          <BurnCoinsShowAddress chain={chain} burnAddress={burnAddress} goBack={cancel} />
        </PobLayout>
      )
    }
  }
}

export const BurnCoins = withStatusGuard(_BurnCoins, 'LOADED')
