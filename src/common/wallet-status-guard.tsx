import React, {ComponentType} from 'react'
import {WalletState, WalletData, WalletStatus} from './wallet-state'
import {Filter} from '../shared/typeUtils'

export type PropsWithWalletState<TProps extends object, TState extends WalletData> = {
  walletState: TState
} & TProps

type StateByStatus<TStatus extends WalletStatus> = Filter<WalletData, {walletStatus: TStatus}>

const isInStatus = <TStatus extends WalletStatus>(
  walletState: WalletData,
  status: TStatus,
): walletState is StateByStatus<TStatus> => {
  return walletState.walletStatus === status
}

interface MessageProps {
  walletStatus: WalletStatus
}
const DefaultMessage = ({walletStatus}: MessageProps): JSX.Element => (
  <>Wrong status: {walletStatus}</>
)

// Adds walletState to the props of the decorated component
// TState specifies the valid WalletState for the component
export function withStatusGuard<TProps extends object, TStatus extends WalletStatus>(
  Component: (props: PropsWithWalletState<TProps, StateByStatus<TStatus>>) => JSX.Element,
  status: TStatus,
  Message: typeof DefaultMessage = DefaultMessage,
): ComponentType<TProps> {
  return function WrappedWithStatusGuard(props: TProps) {
    const walletState = WalletState.useContainer()

    if (!isInStatus<TStatus>(walletState, status)) {
      return <Message walletStatus={walletState.walletStatus} />
    }

    return <Component {...props} walletState={walletState} />
  }
}
