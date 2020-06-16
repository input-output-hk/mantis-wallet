import '@testing-library/jest-dom/extend-expect'
import React, {FunctionComponent} from 'react'
import {render, RenderResult, waitFor, act} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {mockWeb3Worker} from '../web3-mock'
import {makeWeb3Worker} from '../web3'
import {GlacierState} from '../glacier-drop/glacier-state'
import {BuildJobState} from '../common/build-job-state'
import {ThemeState} from '../theme-state'
import {WalletState, WalletStatus} from './wallet-state'

const web3 = makeWeb3Worker(mockWeb3Worker)

const WithGlacierProviders: FunctionComponent = ({children}: {children?: React.ReactNode}) => {
  const initialWalletState = {walletStatus: 'LOADED' as WalletStatus, web3}

  return (
    <ThemeState.Provider>
      <BuildJobState.Provider initialState={{web3}}>
        <WalletState.Provider initialState={initialWalletState}>
          <GlacierState.Provider initialState={{web3}}>{children}</GlacierState.Provider>
        </WalletState.Provider>
      </BuildJobState.Provider>
    </ThemeState.Provider>
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
