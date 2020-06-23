import React from 'react'
import BigNumber from 'bignumber.js'
import {number, text} from '@storybook/addon-knobs'
import {action} from '@storybook/addon-actions'
import {ESSENTIAL_DECORATORS} from '../storybook-util/essential-decorators'
import {withWalletState} from '../storybook-util/wallet-state-decorator'
import {withGlacierState} from '../storybook-util/glacier-state-decorator'
import {withBuildJobState} from '../storybook-util/build-job-state-decorator'
import {withRouterState} from '../storybook-util/router-state-decorator'
import {dust} from '../storybook-util/custom-knobs'
import {estimateFeesWithRandomDelay} from '../storybook-util/dummies'
import {Claim, PeriodConfig} from './glacier-state'
import {GlacierDropOverview} from './GlacierDropOverview'
import {ClaimRow} from './ClaimRow'
import {SubmitProofOfUnlock} from './SubmitProofOfUnlock'
import {WithdrawAvailableDust} from './WithdrawAvailableDust'
import {Epochs, EpochRow} from './Epochs'

export default {
  title: 'Glacier Drop',
  decorators: [
    ...ESSENTIAL_DECORATORS,
    withWalletState,
    withGlacierState,
    withBuildJobState,
    withRouterState,
  ],
}

const MIDNIGHT_ADDRESS = 'm-main-uns-ad1rjfgdj6fewrhlv6j5qxeck38ms2t5sshgg5upk'
const EXTERNAL_ADDRESS = '0xab96032f5a7Efe3B95622c5B9D98D50F96a91756'
const EXAMPLE_AMOUNT = 123456789123456789124
const PERIOD_CONFIG: PeriodConfig = {
  unlockingStartBlock: 1,
  unlockingEndBlock: 5,
  unfreezingStartBlock: 10,
  epochLength: 1,
  numberOfEpochs: 10,
}

const baseClaim = {
  added: new Date(),
  transparentAddress: MIDNIGHT_ADDRESS,
  externalAddress: EXTERNAL_ADDRESS,
  dustAmount: new BigNumber(700000000000),
  isFinalDustAmount: false,
  externalAmount: new BigNumber(1400000000000),
  authSignature: {r: '', s: '', v: 0},
  inclusionProof: '',
  puzzleDuration: 1800,
  powNonce: null,
  unlockTxHash: null,
  withdrawTxHashes: [],
  txStatuses: {},
  numberOfEpochsForFullUnfreeze: 15,
  txBuildInProgress: false,
}

const unsubmittedClaim: Claim = {
  ...baseClaim,
  puzzleStatus: 'unsubmitted',
  withdrawnDustAmount: new BigNumber(0),
  powNonce: 1,
}

const submittedClaim: Claim = {
  ...baseClaim,
  puzzleStatus: 'submitted',
  withdrawnDustAmount: new BigNumber(0),
  unlockTxHash: '0xc41',
  txStatuses: {'0xc41': {status: 'TransactionPending', atBlock: 1}},
  powNonce: 1,
}

export const overview = (): JSX.Element => <GlacierDropOverview />

export const claimSolving = (): JSX.Element => {
  const claim: Claim = {
    ...baseClaim,
    added: new Date(),
    puzzleStatus: 'solving',
    puzzleDuration: number('puzzleDuration', 12345),
    transparentAddress: text('transparentAddress', MIDNIGHT_ADDRESS),
    externalAddress: text('externalAddress', EXTERNAL_ADDRESS),
    dustAmount: new BigNumber(number('dustAmount', 700000000000)),
    externalAmount: new BigNumber(number('externalAmount', 1400000000000)),
    withdrawnDustAmount: new BigNumber(0),
    authSignature: {r: '', s: '', v: 0},
  }

  return (
    <ClaimRow
      claim={claim}
      index={1}
      currentBlock={4}
      periodConfig={PERIOD_CONFIG}
      period={'Unlocking'}
      showEpochs={action('showEpochs')}
      onSubmitPuzzle={action('onSubmitPuzzle')}
      onWithdrawDust={action('onWithdrawDust')}
    />
  )
}

export const claimUnsubmitted = (): JSX.Element => {
  return (
    <ClaimRow
      claim={unsubmittedClaim}
      index={1}
      currentBlock={5}
      periodConfig={PERIOD_CONFIG}
      period={'Unlocking'}
      showEpochs={action('showEpochs')}
      onSubmitPuzzle={action('onSubmitPuzzle')}
      onWithdrawDust={action('onWithdrawDust')}
    />
  )
}

export const claimSubmitted = (): JSX.Element => {
  return (
    <ClaimRow
      claim={{...submittedClaim, withdrawnDustAmount: dust('withdrawn dust', 0)}}
      index={1}
      currentBlock={6}
      periodConfig={PERIOD_CONFIG}
      period={'Unlocking'}
      showEpochs={action('showEpochs')}
      onSubmitPuzzle={action('onSubmitPuzzle')}
      onWithdrawDust={action('onWithdrawDust')}
    />
  )
}

export const submitProofOfUnlock = (): JSX.Element => (
  <SubmitProofOfUnlock
    visible
    currentBlock={1}
    claim={unsubmittedClaim}
    onNext={action('onNext')}
    onCancel={action('onCancel')}
    estimateCallFee={() => estimateFeesWithRandomDelay()}
    estimateGasPrice={estimateFeesWithRandomDelay}
  />
)

export const withdrawAvailableDust = (): JSX.Element => (
  <WithdrawAvailableDust
    visible
    claim={{...submittedClaim, withdrawnDustAmount: dust('withdrawn dust', 0)}}
    currentBlock={10}
    periodConfig={PERIOD_CONFIG}
    showEpochs={action('showEpochs')}
    onNext={action('onNext')}
    onCancel={action('onCancel')}
    estimateCallFee={() => estimateFeesWithRandomDelay()}
    estimateGasPrice={estimateFeesWithRandomDelay}
  />
)

export const epochs = (): JSX.Element => {
  const epochRows: EpochRow[] = [
    {
      transparentAddress: text('Address', MIDNIGHT_ADDRESS),
      dustAmount: new BigNumber(number('Amount', EXAMPLE_AMOUNT)),
      numberOfEpochs: number('Number of Epochs For Full Unfreeze', 5),
    },
    {
      transparentAddress: 'm-main-uns-ABCDjfgdj6fewrhlv6j5qxeck38ms2t5sshgg5upk',
      dustAmount: new BigNumber(9876543219876543212),
      numberOfEpochs: 10,
    },
    {
      transparentAddress: 'm-main-uns-DEFGjfgdj6fewrhlv6j5qxeck38ms2t5sshgg5upk',
      dustAmount: new BigNumber(6789876789876),
      numberOfEpochs: 3,
    },
  ]
  return (
    <Epochs
      visible
      epochRows={epochRows}
      periodConfig={PERIOD_CONFIG}
      currentBlock={number('Current Block', 5)}
    />
  )
}
