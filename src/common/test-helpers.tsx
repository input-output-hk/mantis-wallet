import '@testing-library/jest-dom/extend-expect'
import React, {FunctionComponent} from 'react'
import {render, RenderResult, waitFor, act} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {mockWeb3Worker} from '../web3-mock'
import {makeWeb3Worker} from '../web3'
import {GlacierState} from '../glacier-drop/glacier-state'
import {BuildJobState} from '../common/build-job-state'
import {SettingsState} from '../settings-state'
import {WalletState, WalletStatus} from './wallet-state'
import {BurnStatusType} from '../pob/api/prover'
import {RealBurnStatus} from '../pob/pob-state'

const web3 = makeWeb3Worker(mockWeb3Worker)

const WithGlacierProviders: FunctionComponent = ({children}: {children?: React.ReactNode}) => {
  const initialWalletState = {walletStatus: 'LOADED' as WalletStatus, web3}

  return (
    <SettingsState.Provider>
      <BuildJobState.Provider initialState={{web3}}>
        <WalletState.Provider initialState={initialWalletState}>
          <GlacierState.Provider initialState={{web3}}>{children}</GlacierState.Provider>
        </WalletState.Provider>
      </BuildJobState.Provider>
    </SettingsState.Provider>
  )
}

export const glacierWrappedRender = (ui: React.ReactElement): RenderResult =>
  render(ui, {wrapper: WithGlacierProviders})

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
  fail_reason: null,
  burn_tx_height: 1,
  current_source_height: 1,
  processing_start_height: 1,
  last_tag_height: 1,
  tx_value: txValue,
  isHidden: false,
})
