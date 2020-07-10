import {select, text, number, boolean} from '@storybook/addon-knobs'
import {action, ActionOptions} from '@storybook/addon-actions'
import _ from 'lodash'
import BigNumber from 'bignumber.js'
import {Prover, RealBurnStatus, BurnAddressInfo} from '../pob/pob-state'
import {Chain, CHAINS, ALL_CHAIN_IDS, ChainId} from '../pob/chains'
import {UNITS} from '../common/units'
import {BurnStatusType} from '../pob/api/prover'

export const selectChain = (name = 'Select chain', chainId: ChainId = 'BTC_MAINNET'): Chain =>
  CHAINS[select(name, ALL_CHAIN_IDS, chainId)]

export const selectBurnStatusType = (
  name = 'Burn Status Type',
  burnStatusType: BurnStatusType = 'tx_found',
): BurnStatusType =>
  select(
    name,
    [
      'tx_found',
      'commitment_submitted',
      'commitment_appeared',
      'redeem_submitted',
      'redeem_appeared',
      'redeem_another_prover',
      'proof_fail',
      'commitment_fail',
      'redeem_fail',
    ],
    burnStatusType,
  )

export const dust = (name: string, value: number): BigNumber =>
  UNITS.Dust.toBasic(new BigNumber(number(name, value)))

export const prover = (name: string, value: Partial<Prover> = {}): Prover => {
  const mergedValue: Prover = _.merge(
    {
      name: `${name} prover`,
      address: `${_.lowerCase(name)}.prover.address`,
      rewards: {
        BTC_TESTNET: 10,
        ETH_TESTNET: 15,
      },
    },
    value,
  )

  return {
    name: text(`${name} prover`, mergedValue.name),
    address: text(`${name} prover address`, mergedValue.address),
    rewards: _.mapValues(mergedValue.rewards, (v: number, k) =>
      number(`${name} prover ${k} reward`, v),
    ),
  }
}

export const burnAddressInfo = (
  name = 'Burn Address Info',
  value: Partial<BurnAddressInfo> = {},
): BurnAddressInfo => {
  const mergedValue: BurnAddressInfo = _.merge(
    {
      midnightAddress: `${_.kebabCase(name)}-midnight-address`,
      chainId: 'BTC_MAINNET',
      reward: 1,
      autoConversion: false,
    },
    value,
  )

  return {
    midnightAddress: text(`${name} Midnight Address`, mergedValue.midnightAddress),
    chainId: selectChain(`${name} chain`, mergedValue.chainId).id,
    reward: number(`${name} reward`, mergedValue.reward),
    autoConversion: mergedValue.autoConversion,
  }
}

export const burnStatus = (
  name = 'Burn',
  value: Partial<Omit<RealBurnStatus, 'chain'>> = {},
): RealBurnStatus => {
  const mergedValue: RealBurnStatus = _.merge(
    {
      status: 'tx_found',
      txid: `${_.kebabCase(name)}-source-chain-transaction-id`,
      chain: null,
      commitment_txid: `${_.kebabCase(name)}-commitment-transaction-id`,
      commitment_txid_height: 10,
      redeem_txid: `${_.kebabCase(name)}-redeem-transaction-id`,
      redeem_txid_height: 15,
      burn_tx_height: 1000,
      current_source_height: 1035,
      processing_start_height: 1100,
      fail_reason: `This is an error message for ${name} transaction`,
      last_tag_height: 1,
      tx_value: 2,
      isHidden: false,
    },
    value,
  )

  return {
    status: selectBurnStatusType(`${name} status`, mergedValue.status),
    txid: text(`${name} transaction`, mergedValue.txid),
    chain: null,
    commitment_txid: text(`${name} commitment transaction`, mergedValue.commitment_txid || ''),
    commitment_txid_height: number(
      `${name} commitment transaction height`,
      mergedValue.commitment_txid_height || 1,
    ),
    redeem_txid: text(`${name} redeem transaction`, mergedValue.redeem_txid || ''),
    redeem_txid_height: number(
      `${name} redeem transaction height`,
      mergedValue.redeem_txid_height || 1,
    ),
    burn_tx_height: number(`${name} tx height`, mergedValue.burn_tx_height || 1),
    current_source_height: number(`${name} Current height`, mergedValue.current_source_height || 1),
    processing_start_height: number(
      `${name} processing start height`,
      mergedValue.processing_start_height || 1,
    ),
    fail_reason: text(`${name} fail reason`, mergedValue.fail_reason || ''),
    last_tag_height: mergedValue.last_tag_height,
    tx_value: number(`${name} tokens sent`, mergedValue.tx_value || 1),
    isHidden: boolean(`${name} is hidden`, mergedValue.isHidden),
  }
}

export const asyncAction = (
  name: string,
  delay = 1000,
  options?: ActionOptions | undefined,
  // eslint-disable-next-line
): ((...args: any[]) => Promise<void>) => {
  return (...args) =>
    new Promise(function(resolve) {
      setTimeout(resolve, delay)
    }).then(() => action(name, options)(args))
}
