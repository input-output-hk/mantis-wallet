import React from 'react'
import BigNumber from 'bignumber.js'
import {withKnobs, number, text, select} from '@storybook/addon-knobs'
import {action} from '@storybook/addon-actions'
import {withTheme} from '../storybook-util/theme-switcher'
import {GlacierDropOverview, Claim, availableChains} from './GlacierDropOverview'
import {ClaimRow} from './ClaimRow'
import {SubmitProofOfUnlock} from './SubmitProofOfUnlock'
import {WithdrawAvailableDust} from './WithdrawAvailableDust'

export default {
  title: 'Glacier Drop',
  decorators: [withTheme, withKnobs],
}

const MIDNIGHT_ADDRESS = 'm-main-uns-ad1rjfgdj6fewrhlv6j5qxeck38ms2t5sshgg5upk'
const EXTERNAL_ADDRESS = '0xab96032f5a7Efe3B95622c5B9D98D50F96a91756'
const EXAMPLE_AMOUNT = 123456789123456789124

export const overview = (): JSX.Element => <GlacierDropOverview />

export const claimSolving = (): JSX.Element => {
  const claim: Claim = {
    puzzleStatus: 'solving',
    remainingSeconds: number('remainingSeconds', 12345),
    chain: availableChains[select('chain', [0, 1], 1)],
    midnightAddress: text('midnightAddress', MIDNIGHT_ADDRESS),
    externalAddress: text('externalAddress', EXTERNAL_ADDRESS),
    dustAmount: new BigNumber(number('dustAmount', 700000000000)),
    externalAmount: new BigNumber(number('externalAmount', 1400000000000)),
    unfrozenDustAmount: new BigNumber(0),
    withdrawnDustAmount: new BigNumber(0),
    unfrozen: false,
  }

  return (
    <ClaimRow
      claim={claim}
      index={1}
      onSubmitPuzzle={action('onSubmitPuzzle')}
      onWithdrawDust={action('onWithdrawDust')}
    />
  )
}

const baseClaim = {
  chain: availableChains[1],
  midnightAddress: MIDNIGHT_ADDRESS,
  externalAddress: EXTERNAL_ADDRESS,
  dustAmount: new BigNumber(700000000000),
  externalAmount: new BigNumber(1400000000000),
}
export const claimUnsubmitted = (): JSX.Element => {
  const claim: Claim = {
    puzzleStatus: 'unsubmitted',
    unfrozenDustAmount: new BigNumber(0),
    withdrawnDustAmount: new BigNumber(0),
    unfrozen: false,
    ...baseClaim,
  }

  return (
    <ClaimRow
      claim={claim}
      index={1}
      onSubmitPuzzle={action('onSubmitPuzzle')}
      onWithdrawDust={action('onWithdrawDust')}
    />
  )
}

export const claimSubmitted = (): JSX.Element => {
  const claim: Claim = {
    puzzleStatus: 'submitted',
    unfrozenDustAmount: new BigNumber(number('unfrozen dust', 70000000000)),
    withdrawnDustAmount: new BigNumber(number('withdrawn dust', 0)),
    unfrozen: true,
    ...baseClaim,
  }

  return (
    <ClaimRow
      claim={claim}
      index={1}
      onSubmitPuzzle={action('onSubmitPuzzle')}
      onWithdrawDust={action('onWithdrawDust')}
    />
  )
}

export const submitProofOfUnlock = (): JSX.Element => (
  <SubmitProofOfUnlock
    visible
    midnightAmount={new BigNumber(number('midnight amount', EXAMPLE_AMOUNT))}
    midnightAddress={text('midnight address', MIDNIGHT_ADDRESS)}
    onNext={action('onNext')}
    onCancel={action('onCancel')}
  />
)

export const withdrawAvailableDust = (): JSX.Element => (
  <WithdrawAvailableDust
    visible
    midnightAddress={text('midnight address', MIDNIGHT_ADDRESS)}
    onNext={action('onNext')}
    onCancel={action('onCancel')}
  />
)
