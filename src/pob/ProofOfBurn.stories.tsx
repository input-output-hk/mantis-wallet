import React from 'react'
import {action} from '@storybook/addon-actions'
import {withKnobs, text, array} from '@storybook/addon-knobs'
import {WalletState} from '../common/wallet-state'
import {ProofOfBurn} from './ProofOfBurn'
import {ProofOfBurnState} from './pob-state'
import {CreateBurnModal} from './modals/CreateBurnModal'
import {WatchBurnModal} from './modals/WatchBurnModal'

export default {
  title: 'Proof of Burn',
  decorators: [withKnobs],
}

export const proofOfBurn = (): JSX.Element => (
  <ProofOfBurnState.Provider>
    <WalletState.Provider>
      <ProofOfBurn></ProofOfBurn>
    </WalletState.Provider>
  </ProofOfBurnState.Provider>
)

export const createBurnModal = (): JSX.Element => (
  <CreateBurnModal
    visible
    provers={[
      {
        name: text('First prover', 'First prover'),
        address: text('First prover address', 'first.prover.address'),
      },
      {
        name: text('Second prover', 'Second prover'),
        address: text('Second prover address', 'second.prover.address'),
      },
    ]}
    transparentAddresses={array('Transparent addresses', ['first-address', 'second-address'])}
    errorMessage={text('Error message', '')}
    onCancel={action('on-canel')}
    onCreateBurn={async (...args): Promise<void> => action('on-create-burn')(args)}
  />
)

export const watchBurnModal = (): JSX.Element => (
  <WatchBurnModal
    visible
    provers={[
      {
        name: text('First prover', 'First prover'),
        address: text('First prover address', 'first.prover.address'),
      },
      {
        name: text('Second prover', 'Second prover'),
        address: text('Second prover address', 'second.prover.address'),
      },
    ]}
    onCancel={action('on-canel')}
    onWatchBurn={action('on-watch')}
  />
)
