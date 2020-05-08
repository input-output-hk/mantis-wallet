import React from 'react'
import {withKnobs, select, text, number} from '@storybook/addon-knobs'
import {withTheme} from '../storybook-util/theme-switcher'
import {withWalletState} from '../storybook-util/wallet-state-decorator'
import {BurnStatusDisplay} from './BurnStatusDisplay'
import {BurnActivity} from './BurnActivity'
import {selectChain} from '../storybook-util/custom-knobs'

export default {
  title: 'Burn Activity',
  decorators: [withWalletState, withTheme, withKnobs],
}

const burnStatusSelect = select(
  'Burn status',
  [
    'tx_found',
    'commitment_submitted',
    'commitment_appeared',
    'redeem_submitted',
    'redeem_appeared',
    'redeem_another_prover',
    'proof_fail',
    'commitment_fail',
    'redeem_fail',
  ],
  'tx_found',
)

export const burnActivity = (): JSX.Element => (
  <div>
    <BurnActivity
      burnStatuses={{
        [text('Burn address #1', '0xajfSDFJSFHKFGS8347faGSAFd743fsbj743fay4z')]: {
          lastStatuses: [
            {
              burnAddressInfo: {
                midnightAddress: 'midnight-address',
                chainId: selectChain().id,
                reward: 1,
                autoConversion: false,
              },
              status: burnStatusSelect,
              txid: text('Transaction id', 'source-chain-transaction-very-very-very-very-long-id'),
              chain: selectChain().id,
              commitment_txid: text('Commitment transaction id', 'commitment-transaction-id'),
              commitment_txid_height: number('Commitment transaction height', 10),
              redeem_txid: text('Redeem transaction id', 'redeem-transaction-id'),
              redeem_txid_height: number('Redeem transaction height', 15),
              burn_tx_height: 1,
              current_source_height: 1,
              processing_start_height: 1,
              last_tag_height: 1,
              tx_value: number('Burn tokens sent', 2),
            },
          ],
          errorMessage: text('An error message #1', 'This is an error message for Burn Address #1'),
        },
        [text('Burn address #2', '0xajfSDFJSFHKFGS8347faGSAFd743fsbj743fay42')]: {
          lastStatuses: [],
          errorMessage: text('An error message #2', 'This is an error message for Burn Address #1'),
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
        burnAddressInfo: {
          midnightAddress: 'midnight-address',
          chainId: selectChain().id,
          reward: 1,
          autoConversion: false,
        },
        status: burnStatusSelect,
        txid: text('Transaction id', 'source-chain-transaction-very-very-very-very-long-id'),
        chain: selectChain().id,
        commitment_txid: text('Commitment transaction id', 'commitment-transaction-id'),
        commitment_txid_height: number('Commitment transaction height', 10),
        redeem_txid: text('Redeem transaction id', 'redeem-transaction-id'),
        redeem_txid_height: number('Redeem transaction height', 15),
        burn_tx_height: number('Burn tx height', 1000),
        current_source_height: number('Current height', 1001),
        processing_start_height: number('Processing start height', 1100),
        last_tag_height: 1,
        tx_value: number('Burn tokens sent', 2),
      }}
      syncStatus={{
        mode: select('Sync status type', ['online', 'offline'], 'online'),
        currentBlock: 0,
        highestKnownBlock: number('Highest known block', 11),
        percentage: 100,
      }}
      errorMessage={text('An error message #1', 'This is an error message for Burn Address #1')}
    />
  </div>
)
