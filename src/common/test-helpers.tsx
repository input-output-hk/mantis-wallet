/* eslint-disable react/display-name */
import '@testing-library/jest-dom/extend-expect'
import React, {FunctionComponent} from 'react'
import Web3 from 'web3'
import BigNumber from 'bignumber.js'
import {waitFor, act} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {SettingsState} from '../settings-state'
import {defaultWalletData, WalletState, WalletStatus, StoreWalletData} from './wallet-state'
import {BackendState} from './backend-state'
import {abbreviateAmount} from './formatters'
import {EN_US_BIG_NUMBER_FORMAT} from './i18n'
import {createInMemoryStore} from './store'

const web3 = new Web3()

export const WithSettingsProvider: FunctionComponent = ({
  children,
}: {
  children?: React.ReactNode
}) => <SettingsState.Provider>{children}</SettingsState.Provider>

export const createWithProviders = (
  walletData: StoreWalletData | null = null,
): FunctionComponent => ({children}: {children?: React.ReactNode}) => {
  const initialState = {
    walletStatus: 'LOADED' as WalletStatus,
    store: createInMemoryStore(walletData ?? defaultWalletData),
    isMocked: true,
    web3,
  }

  return (
    <SettingsState.Provider>
      <BackendState.Provider initialState={{web3}}>
        <WalletState.Provider initialState={initialState}>{children}</WalletState.Provider>
      </BackendState.Provider>
    </SettingsState.Provider>
  )
}

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

export const abbreviateAmountForEnUS = (bg: BigNumber): ReturnType<typeof abbreviateAmount> =>
  abbreviateAmount(bg, EN_US_BIG_NUMBER_FORMAT)

export const DIALOG_VALIDATION_ERROR =
  'Some fields require additional action before you can continue.'

export const expectNoValidationErrorOnSubmit = async (
  queryByText: (text: string) => HTMLElement | null,
  submitButton: HTMLElement,
): Promise<void> => {
  userEvent.click(submitButton)
  await waitFor(() => expect(queryByText(DIALOG_VALIDATION_ERROR)).not.toBeInTheDocument())
}
