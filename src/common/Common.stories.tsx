import React from 'react'
import {text, number, boolean} from '@storybook/addon-knobs'
import {ESSENTIAL_DECORATORS} from '../storybook-util/essential-decorators'
import {dust} from '../storybook-util/custom-knobs'
import {ShortNumber} from './ShortNumber'
import {Loading} from './Loading'
import {CopyableLongText} from './CopyableLongText'
import {StatusModal} from './StatusModal'
import {SupportModal} from './SupportModal'
import {MiningStatus} from './MiningStatus'

export default {
  title: 'Common',
  decorators: ESSENTIAL_DECORATORS,
}

export const shortNumber = (): JSX.Element => (
  <ShortNumber big={dust('Number', 123456789)} unitOrDecimals="Dust" />
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
        status: 'notRunning',
      },
      wallet: {
        status: 'notRunning',
      },
      node: {
        status: 'notRunning',
      },
      dag: {
        status: 'notRunning',
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

export const supportModal = (): JSX.Element => <SupportModal visible />
