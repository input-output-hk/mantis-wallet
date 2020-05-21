import React from 'react'
import {withKnobs, select, text, number} from '@storybook/addon-knobs'
import {withTheme} from '../storybook-util/theme-switcher'
import {withWalletState} from '../storybook-util/wallet-state-decorator'
import {BurnStatusDisplay} from './BurnStatusDisplay'
import {BurnActivity} from './BurnActivity'
import {selectChain, selectBurnStatus} from '../storybook-util/custom-knobs'
import {RealBurnStatus} from './pob-state'

export default {
  title: 'Burn Activity',
  decorators: [withWalletState, withTheme, withKnobs],
}

export const burnActivity = (): JSX.Element => (
  <div>
    <BurnActivity
      burnStatuses={{
        [text('Burn address #1', 'Burn address #1')]: {
          lastStatuses: [
            {
              burnAddressInfo: {
                midnightAddress: 'midnight-address',
                chainId: selectChain().id,
                reward: 1,
                autoConversion: false,
              },
              status: selectBurnStatus('Burn Status #1'),
              txid: text('Transaction id', 'source-chain-transaction-very-very-very-very-long-id'),
              chain: selectChain().id,
              commitment_txid: text('Commitment transaction id', 'commitment-transaction-id'),
              commitment_txid_height: number('Commitment transaction height', 10),
              redeem_txid: text('Redeem transaction id', 'redeem-transaction-id'),
              redeem_txid_height: number('Redeem transaction height', 15),
              fail_reason: text(
                'An error message #1',
                'This is an error message for Burn Address #1',
              ),
              burn_tx_height: 1,
              current_source_height: 1,
              processing_start_height: 1,
              last_tag_height: 1,
              tx_value: number('Burn tokens sent', 2),
            } as RealBurnStatus,
          ],
        },
        [text('Burn address #2', 'Burn address #2')]: {
          lastStatuses: [
            {
              burnAddressInfo: {
                midnightAddress: 'midnight-address',
                chainId: selectChain().id,
                reward: 1,
                autoConversion: false,
              },
              status: selectBurnStatus('Burn Status #2'),
              txid: text('Transaction id', 'source-chain-transaction-very-very-very-very-long-id'),
              chain: selectChain().id,
              commitment_txid: text('Commitment transaction id', 'commitment-transaction-id'),
              commitment_txid_height: number('Commitment transaction height', 10),
              redeem_txid: text('Redeem transaction id', 'redeem-transaction-id'),
              redeem_txid_height: number('Redeem transaction height', 15),
              fail_reason: null,
              burn_tx_height: 1,
              current_source_height: 1,
              processing_start_height: 1,
              last_tag_height: 1,
              tx_value: number('Burn tokens sent', 2),
            } as RealBurnStatus,
          ],
          errorMessage: text('An error message #2', 'This is an error message for Burn Address #2'),
        },
        [text('Burn address #3', 'Burn address #3')]: {
          lastStatuses: [],
          errorMessage: text('An error message #3', 'This is an error message for Burn Address #3'),
        },
        [text('Burn address #4', 'Burn address #4')]: {
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
      burnStatus={
        {
          burnAddressInfo: {
            midnightAddress: 'midnight-address',
            chainId: selectChain().id,
            reward: 1,
            autoConversion: false,
          },
          status: selectBurnStatus(),
          txid: text('Transaction id', 'source-chain-transaction-very-very-very-very-long-id'),
          chain: selectChain().id,
          commitment_txid: text('Commitment transaction id', 'commitment-transaction-id'),
          commitment_txid_height: number('Commitment transaction height', 10),
          redeem_txid: text('Redeem transaction id', 'redeem-transaction-id'),
          redeem_txid_height: number('Redeem transaction height', 15),
          burn_tx_height: number('Burn tx height', 1000),
          current_source_height: number('Current height', 1001),
          processing_start_height: number('Processing start height', 1100),
          fail_reason: text('A fail reason', 'This is a error message for this burn transaction'),
          last_tag_height: 1,
          tx_value: number('Burn tokens sent', 2),
        } as RealBurnStatus
      }
      syncStatus={{
        mode: select('Sync status type', ['online', 'offline'], 'online'),
        currentBlock: 0,
        highestKnownBlock: number('Highest known block', 11),
        percentage: 100,
      }}
      errorMessage={text('An error message', 'This is a global error message for Burn Address')}
    />
  </div>
)
