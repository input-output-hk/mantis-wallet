import React from 'react'
import {select, text, number} from '@storybook/addon-knobs'
import {action} from '@storybook/addon-actions'
import {ESSENTIAL_DECORATORS} from '../storybook-util/essential-decorators'
import {withWalletState} from '../storybook-util/wallet-state-decorator'
import {withBuildJobState} from '../storybook-util/build-job-state-decorator'
import {BurnStatusDisplay} from './BurnStatusDisplay'
import {BurnActivity} from './BurnActivity'
import {burnStatus, prover, burnAddressInfo} from '../storybook-util/custom-knobs'

export default {
  title: 'Burn Activity',
  decorators: [...ESSENTIAL_DECORATORS, withWalletState, withBuildJobState],
}

export const burnActivity = (): JSX.Element => {
  const someProver = prover('Test')
  const burnAddress1 = text('Burn address #1', 'Burn address #1')
  const burnAddress2 = text('Burn address #2', 'Burn address #2')
  const burnAddress3 = text('Burn address #3', 'Burn address #3')
  const burnAddress4 = text('Burn address #4', 'Burn address #4')

  return (
    <div>
      <BurnActivity
        burnAddresses={{
          [burnAddress1]: burnAddressInfo('Burn Address #1 Info'),
          [burnAddress2]: burnAddressInfo('Burn Address #2 Info'),
          [burnAddress3]: burnAddressInfo('Burn Address #3 Info'),
          [burnAddress4]: burnAddressInfo('Burn Address #4 Info'),
        }}
        burnStatuses={[
          {
            burnWatcher: {
              burnAddress: burnAddress1,
              prover: someProver,
            },
            lastStatuses: [burnStatus('Burn #1')],
            isHidden: false,
          },
          {
            burnWatcher: {
              burnAddress: burnAddress2,
              prover: someProver,
            },
            lastStatuses: [burnStatus('Burn #2')],
            error: Error(
              text('An error message #2', 'This is an error message for Burn Address #2'),
            ),
            isHidden: false,
          },
          {
            burnWatcher: {
              burnAddress: burnAddress3,
              prover: someProver,
            },
            lastStatuses: [],
            error: Error(
              text('An error message #3', 'This is an error message for Burn Address #3'),
            ),
            isHidden: false,
          },
          {
            burnWatcher: {
              burnAddress: burnAddress4,
              prover: someProver,
            },
            lastStatuses: [],
            isHidden: false,
          },
        ]}
        hideBurnWatcher={action('on-hide-burn-watcher')}
        hideBurnProcess={action('on-hide-burn-process')}
      />
    </div>
  )
}

export const burnStatusDisplay = (): JSX.Element => (
  <div>
    <BurnStatusDisplay
      burnAddressInfo={burnAddressInfo()}
      burnWatcher={{
        burnAddress: text('Burn address', '0xajfSDFJSFHKFGS8347faGSAFd743fsbj743fay4z'),
        prover: prover('Test'),
      }}
      burnStatus={burnStatus('Burn', {status: 'commitment_appeared'})}
      syncStatus={{
        mode: select('Sync status type', ['online', 'offline'], 'online'),
        currentBlock: 0,
        highestKnownBlock: number('Highest known block', 11),
        percentage: 100,
      }}
      error={Error(text('An error message', 'This is a global error message for Burn Address'))}
      hideBurnProcess={action('on-hide-burn-process')}
    />
  </div>
)
