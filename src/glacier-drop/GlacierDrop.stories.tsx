import React from 'react'
import {withKnobs, number, text, select} from '@storybook/addon-knobs'
import {action} from '@storybook/addon-actions'
import BigNumber from 'bignumber.js'
import {withTheme} from '../storybook-util/theme-switcher'
import {withWalletState} from '../storybook-util/wallet-state-decorator'
import {GlacierDropOverview, Claim, availableChains} from './GlacierDropOverview'
import {ClaimRow} from './ClaimRow'

export default {
  title: 'Glacier Drop',
  decorators: [withWalletState, withTheme, withKnobs],
}

export const overview = (): JSX.Element => <GlacierDropOverview />

export const claimSolving = (): JSX.Element => {
  const claim: Claim = {
    puzzleStatus: 'solving',
    remainingSeconds: number('remainingSeconds', 12345),
    chain: availableChains[select('chain', [0, 1], 1)],
    midnightAddress: text(
      'midnightAddress',
      'm-main-uns-ad1qqxcxcspxx8vdzv6va2qdypcy7q8gv5q2ut0mu',
    ),
    externalAddress: text('externalAddress', '0xDf7D7e053933b5cC24372f878c90E62dADAD5d42'),
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
  midnightAddress: 'm-main-uns-ad1qqxcxcspxx8vdzv6va2qdypcy7q8gv5q2ut0mu',
  externalAddress: '0xDf7D7e053933b5cC24372f878c90E62dADAD5d42',
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
