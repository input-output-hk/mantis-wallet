import React from 'react'
import BigNumber from 'bignumber.js'
import {action} from '@storybook/addon-actions'
import {array, number, text} from '@storybook/addon-knobs'
import {ESSENTIAL_DECORATORS} from '../../storybook-util/essential-decorators'
import {withGlacierState} from '../../storybook-util/glacier-state-decorator'
import {withBuildJobState} from '../../storybook-util/build-job-state-decorator'
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
  decorators: [...ESSENTIAL_DECORATORS, withGlacierState, withBuildJobState],
}

export const enterAddress = (): JSX.Element => (
  <EnterAddress visible onNext={action('onNext')} onCancel={action('onCancel')} />
)

export const verifyAddress = (): JSX.Element => (
  <VerifyAddress
    visible
    externalAddress={text('external address', EXTERNAL_ADDRESS)}
    transparentAddress={text('midnight address', MIDNIGHT_ADDRESS)}
    onCancel={action('onCancel')}
    onNext={action('onNext')}
  />
)

export const generatedMessage = (): JSX.Element => (
  <GeneratedMessage
    visible
    externalAddress={text('external address', EXTERNAL_ADDRESS)}
    transparentAddress={text('midnight address', MIDNIGHT_ADDRESS)}
    onNext={action('onNext')}
  />
)

export const claimWithKey = (): JSX.Element => (
  <ClaimWithKey
    visible
    externalAmount={new BigNumber(number('external amount', EXAMPLE_AMOUNT))}
    minimumDustAmount={new BigNumber(number('midnight amount', EXAMPLE_AMOUNT))}
    transparentAddress={text('midnight address', MIDNIGHT_ADDRESS)}
    onNext={action('onNext')}
    onCancel={action('onCancel')}
  />
)

export const claimWithMessage = (): JSX.Element => (
  <ClaimWithMessage
    visible
    externalAmount={new BigNumber(number('external amount', EXAMPLE_AMOUNT))}
    minimumDustAmount={new BigNumber(number('midnight amount', EXAMPLE_AMOUNT))}
    transparentAddress={text('midnight address', MIDNIGHT_ADDRESS)}
    onNext={action('onNext')}
    onCancel={action('onCancel')}
  />
)

export const exchange = (): JSX.Element => (
  <Exchange
    visible
    externalAmount={new BigNumber(number('external amount', EXAMPLE_AMOUNT))}
    minimumDustAmount={new BigNumber(number('midnight amount', EXAMPLE_AMOUNT))}
    availableDust={new BigNumber(number('available dust', EXAMPLE_AMOUNT))}
    transparentAddresses={array('Transparent addresses', [MIDNIGHT_ADDRESS, MIDNIGHT_ADDRESS2])}
    onNext={action('onNext')}
    onCancel={action('onCancel')}
  />
)

export const selectMethod = (): JSX.Element => (
  <SelectMethod
    visible
    onPrivateKey={action('onPrivateKey')}
    onMessageCreate={action('onMessageCreate')}
    onMessageUseSigned={action('onMessageUseSigned')}
  />
)
