import React from 'react'
import {withKnobs, select, text, number} from '@storybook/addon-knobs'
import {withTheme} from '../storybook-util/theme-switcher'
import {withWalletState} from '../storybook-util/wallet-state-decorator'
import {withBuildJobState} from '../storybook-util/build-job-state-decorator'
import {BurnStatusDisplay} from './BurnStatusDisplay'
import {BurnActivity} from './BurnActivity'
import {burnStatus} from '../storybook-util/custom-knobs'

export default {
  title: 'Burn Activity',
  decorators: [withWalletState, withTheme, withBuildJobState, withKnobs],
}

export const burnActivity = (): JSX.Element => (
  <div>
    <BurnActivity
      burnStatuses={{
        [text('Burn address #1', 'Burn address #1')]: {
          lastStatuses: [burnStatus('Burn #1')],
        },
        [text('Burn address #2', 'Burn address #2')]: {
          lastStatuses: [burnStatus('Burn #2')],
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
      burnStatus={burnStatus()}
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
