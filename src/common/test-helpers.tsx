import '@testing-library/jest-dom/extend-expect'
import React, {FunctionComponent} from 'react'
import BigNumber from 'bignumber.js'
import {waitFor, act} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {SettingsState} from '../settings-state'
import {BurnStatusType} from '../pob/api/prover'
import {RealBurnStatus} from '../pob/pob-state'
import {abbreviateAmount} from './formatters'
import {EN_US_BIG_NUMBER_FORMAT} from './i18n'

export const WithSettingsProvider: FunctionComponent = ({
  children,
}: {
  children?: React.ReactNode
}) => <SettingsState.Provider>{children}</SettingsState.Provider>

export const expectCalledOnClick = async (
  getter: () => HTMLElement,
  toBeCalledFn: CallableFunction,
): Promise<void> => {
  expect(toBeCalledFn).not.toBeCalled()
  const button = getter()
  expect(button).toBeEnabled()
  await act(async () => userEvent.click(button))
  await waitFor(() => expect(toBeCalledFn).toBeCalled())
}

export const findExactlyOneByTag = (element: HTMLElement, tagName: string): Element => {
  const possibleElementsByTag = element.getElementsByTagName(tagName)
  expect(possibleElementsByTag).toHaveLength(1)
  return possibleElementsByTag[0]
}

export const createBurnStatus = (
  status: BurnStatusType,
  txValue: number,
  txid = 'source-chain-burn-transaction-id',
): RealBurnStatus & {tx_value: number} => ({
  status,
  txid,
  chain: null,
  commitment_txid: 'midnight-transaction-id',
  commitment_tx_height: 10,
  redeem_txid: null,
  redeem_tx_height: null,
  redeem_tx_timestamp: null,
  fail_reason: null,
  burn_tx_height: 1,
  current_source_height: 1,
  processing_start_height: 1,
  last_tag_height: 1,
  tx_value: txValue,
  isHidden: false,
  timestamps: {
    tx_found: new Date(2020, 4, 17, 3, 24, 0),
    commitment_submitted: null,
    redeem_submitted: null,
  },
})

export const abbreviateAmountForEnUS = (bg: BigNumber): ReturnType<typeof abbreviateAmount> =>
  abbreviateAmount(bg, EN_US_BIG_NUMBER_FORMAT)

export const DIALOG_VALIDATION_ERROR =
  'Some fields require additional action before you can continue.'
