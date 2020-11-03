import React from 'react'
import {text, number} from '@storybook/addon-knobs'
import {ESSENTIAL_DECORATORS} from '../storybook-util/essential-decorators'
import {ether} from '../storybook-util/custom-knobs'
import {ShortNumber} from './ShortNumber'
import {Loading} from './Loading'
import {CopyableLongText} from './CopyableLongText'
import {StatusModal} from './StatusModal'
import {SupportModal} from './SupportModal'
import {ETC_CHAIN} from './chains'

export default {
  title: 'Common',
  decorators: ESSENTIAL_DECORATORS,
}

export const shortNumber = (): JSX.Element => (
  <ShortNumber big={ether('Number', 123456789)} decimals={ETC_CHAIN.decimals} />
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

        mantisWalletVersion: text('Wallet Version', '0.11.0'),
        mainPid: 123,
      },
    }}
    config={{
      dataDir: text('data dir', '~/.mantis-wallet'),
      rpcAddress: new URL(text('RPC address', 'https://127.0.0.1:8546')),
    }}
    visible
  />
)

export const supportModal = (): JSX.Element => <SupportModal visible />
