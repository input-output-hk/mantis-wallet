import React from 'react'
import {withKnobs, select, text} from '@storybook/addon-knobs'
import {withTheme} from '../storybook-util/theme-switcher'
import {withWalletState} from '../storybook-util/wallet-state-decorator'
import {BurnStatusDisplay} from './BurnStatusDisplay'
import {BurnActivity} from './BurnActivity'

export default {
  title: 'Burn Activity',
  decorators: [withWalletState, withTheme, withKnobs],
}

export const burnActivity = (): JSX.Element => (
  <div style={{padding: '24px'}}>
    <BurnActivity
      burnStatuses={{
        [text('Burn address', '0xajfSDFJSFHKFGS8347faGSAFd743fsbj743fay4z')]: {
          lastStatus: {
            status: select(
              'Burn status',
              [
                'No burn transactions observed.',
                'BURN_OBSERVED',
                'PROOF_READY',
                'PROOF_FAIL',
                'COMMITMENT_APPEARED',
                'COMMITMENT_CONFIRMED',
                'COMMITMENT_FAIL',
                'REVEAL_APPEARED',
                'REVEAL_CONFIRMED',
                'REVEAL_FAIL',
                'REVEAL_DONE_ANOTHER_PROVER',
              ],
              'BURN_OBSERVED',
            ),
            txid: text('Transaction id', 'source-chain-transaction-very-very-very-very-long-id'),
            chain: select('Chain', ['BTC_TESTNET', 'ETH_TESTNET'], 'ETH_TESTNET'),
            midnight_txid: text('Midnight transaction id', 'midnight-transaction-id'),
            burn_tx_height: 1,
            current_source_height: 1,
            processing_start_height: 1,
            last_tag_height: 1,
          },
          error: new Error(text('An error message', 'This is an error message')),
        },
      }}
    />
  </div>
)

export const burnStatusDisplay = (): JSX.Element => (
  <div style={{padding: '24px'}}>
    <BurnStatusDisplay
      address={text('Burn address', '0xajfSDFJSFHKFGS8347faGSAFd743fsbj743fay4z')}
      status={{
        lastStatus: {
          status: select(
            'Burn status',
            [
              'No burn transactions observed.',
              'BURN_OBSERVED',
              'PROOF_READY',
              'PROOF_FAIL',
              'COMMITMENT_APPEARED',
              'COMMITMENT_CONFIRMED',
              'COMMITMENT_FAIL',
              'REVEAL_APPEARED',
              'REVEAL_CONFIRMED',
              'REVEAL_FAIL',
              'REVEAL_DONE_ANOTHER_PROVER',
            ],
            'BURN_OBSERVED',
          ),
          txid: text('Transaction id', 'source-chain-transaction-very-very-very-very-long-id'),
          chain: select('Chain', ['BTC_TESTNET', 'ETH_TESTNET'], 'ETH_TESTNET'),
          midnight_txid: text('Midnight transaction id', 'midnight-transaction-id'),
          burn_tx_height: 1,
          current_source_height: 1,
          processing_start_height: 1,
          last_tag_height: 1,
        },
        error: new Error(text('An error message', 'This is an error message')),
      }}
    />
  </div>
)
