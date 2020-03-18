import React from 'react'
import BigNumber from 'bignumber.js'
import {action} from '@storybook/addon-actions'
import {withKnobs, array, number, text, select} from '@storybook/addon-knobs'
import {withTheme} from '../../storybook-util/theme-switcher'
import {availableChains} from '../GlacierDropOverview'
import {EnterAddress} from './EnterAddress'
import {VerifyAddress} from './VerifyAddress'
import {GeneratedMessage} from './GeneratedMessage'
import {ClaimWithKey} from './ClaimWithKey'
import {ClaimWithMessage} from './ClaimWithMessage'
import {Exchange} from './Exchange'
import {SelectMethod} from './SelectMethod'

const EXTERNAL_ADDRESS = '0xab96032f5a7Efe3B95622c5B9D98D50F96a91756'
const MIDNIGHT_ADDRESS = 'm-main-uns-ad1rjfgdj6fewrhlv6j5qxeck38ms2t5sshgg5upk'
const MIDNIGHT_ADDRESS2 = 'm-main-uns-foorjfgdj6fewrhlv6j5qxeck38ms2t5sshgg5upk'
const EXAMPLE_AMOUNT = 123456789123456789124

export default {
  title: 'Glacier Drop Claim Dust',
  decorators: [withTheme, withKnobs],
}

export const enterAddress = (): JSX.Element => (
  <EnterAddress
    visible
    chain={availableChains[select('chain', [0, 1], 0)]}
    onNext={action('onNext')}
    onCancel={action('onCancel')}
  />
)

export const verifyAddress = (): JSX.Element => (
  <VerifyAddress
    visible
    chain={availableChains[select('chain', [0, 1], 0)]}
    externalAddress={text('external address', EXTERNAL_ADDRESS)}
    midnightAddress={text('midnight address', MIDNIGHT_ADDRESS)}
    onCancel={action('onCancel')}
    onNext={action('onNext')}
  />
)

export const generatedMessage = (): JSX.Element => (
  <GeneratedMessage
    visible
    externalAddress={text('external address', EXTERNAL_ADDRESS)}
    midnightAddress={text('midnight address', MIDNIGHT_ADDRESS)}
    onNext={action('onNext')}
  />
)

export const claimWithKey = (): JSX.Element => (
  <ClaimWithKey
    visible
    chain={availableChains[select('chain', [0, 1], 0)]}
    externalAmount={new BigNumber(number('external amount', EXAMPLE_AMOUNT))}
    midnightAmount={new BigNumber(number('midnight amount', EXAMPLE_AMOUNT))}
    midnightAddress={text('midnight address', MIDNIGHT_ADDRESS)}
    onNext={action('onNext')}
  />
)

export const claimWithMessage = (): JSX.Element => (
  <ClaimWithMessage
    visible
    chain={availableChains[select('chain', [0, 1], 0)]}
    externalAmount={new BigNumber(number('external amount', EXAMPLE_AMOUNT))}
    midnightAmount={new BigNumber(number('midnight amount', EXAMPLE_AMOUNT))}
    midnightAddress={text('midnight address', MIDNIGHT_ADDRESS)}
    onNext={action('onNext')}
  />
)

export const exchange = (): JSX.Element => (
  <Exchange
    visible
    chain={availableChains[select('chain', [0, 1], 0)]}
    externalAmount={new BigNumber(number('external amount', EXAMPLE_AMOUNT))}
    midnightAmount={new BigNumber(number('midnight amount', EXAMPLE_AMOUNT))}
    availableDust={new BigNumber(number('available dust', EXAMPLE_AMOUNT))}
    transparentAddresses={array('Transparent addresses', [MIDNIGHT_ADDRESS, MIDNIGHT_ADDRESS2])}
    onNext={action('onNext')}
  />
)

export const selectMethod = (): JSX.Element => (
  <SelectMethod
    visible
    chain={availableChains[select('chain', [0, 1], 0)]}
    onPrivateKey={action('onPrivateKey')}
    onMessageCreate={action('onMessageCreate')}
    onMessageUseSigned={action('onMessageUseSigned')}
  />
)
