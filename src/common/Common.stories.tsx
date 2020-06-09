import React from 'react'
import {withKnobs, text, number, boolean} from '@storybook/addon-knobs'
import {withMiningState} from '../storybook-util/mining-state-decorator'
import {withTheme} from '../storybook-util/theme-switcher'
import {dust} from '../storybook-util/custom-knobs'
import {ShortNumber} from './ShortNumber'
import {Loading} from './Loading'
import {CopyableLongText} from './CopyableLongText'
import {StatusModal} from './StatusModal'
import {MiningStatus} from './MiningStatus'

export default {
  title: 'Common',
  decorators: [withTheme, withMiningState, withKnobs],
}

export const shortNumber = (): JSX.Element => (
  <ShortNumber big={dust('Number', 123456789)} unit="Dust" />
)

export const loading = (): JSX.Element => (
  <div style={{width: '100vw', height: '100vh'}}>
    <Loading />
  </div>
)

export const copyableLongText = (): JSX.Element => (
  <CopyableLongText
    content={text('Copyable long text', 'This text can be copied by clicking the icon.')}
  />
)

export const statusModal = (): JSX.Element => (
  <StatusModal
    status={{
      fetchParams: {
        status: 'not-running',
      },
      wallet: {
        status: 'not-running',
      },
      node: {
        status: 'not-running',
      },
      dag: {
        status: 'not-running',
      },
      info: {
        platform: text('Platform', 'Linux'),
        platformVersion: text('Platform version', 'Linux X'),
        cpu: text('CPU', 'Intel'),
        memory: number('memory', 16000000000),

        lunaVersion: text('Luna Version', '0.11.0'),
        mainPid: 123,
      },
    }}
    config={{
      dataDir: text('data dir', '~/.luna'),
      rpcAddress: text('RPC address', 'https://127.0.0.1:8546'),
    }}
    managedConfig={{
      miningEnabled: boolean('Mining enabled', true),
    }}
    visible
  />
)

export const miningStatus = (): JSX.Element => <MiningStatus />
