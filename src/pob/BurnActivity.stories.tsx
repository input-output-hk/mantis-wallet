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
  <div>
    <BurnActivity
      burnStatuses={{
        [text('Burn address #1', '0xajfSDFJSFHKFGS8347faGSAFd743fsbj743fay4z')]: {
          lastStatuses: [
            {
              status: select(
                'Burn status',
                [
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
          ],
          error: new Error(
            text('An error message #1', 'This is an error message for Burn Address #1'),
          ),
        },
        [text('Burn address #2', '0xajfSDFJSFHKFGS8347faGSAFd743fsbj743fay42')]: {
          lastStatuses: [],
          error: new Error(
            text('An error message #2', 'This is an error message for Burn Address #2'),
          ),
        },
        [text('Burn address #3', '0xajfSDFJSFHKFGS8347faGSAFd743fsbj743fay43')]: {
          lastStatuses: [],
        },
      }}
    />
  </div>
)

export const burnStatusDisplay = (): JSX.Element => (
  <div>
    <BurnStatusDisplay
      address={text('Burn address', '0xajfSDFJSFHKFGS8347faGSAFd743fsbj743fay4z')}
      burnStatus={{
        status: select(
          'Burn status',
          [
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
      }}
      error={new Error(text('An error message', 'This is an error message'))}
    />
  </div>
)
