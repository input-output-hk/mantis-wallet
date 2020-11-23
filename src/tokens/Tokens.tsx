import React, {useState, useEffect} from 'react'
import {Button} from 'antd'
import {EmptyProps} from 'antd/lib/empty'
import _ from 'lodash/fp'
import {pipe} from 'fp-ts/lib/function'
import {fold} from 'fp-ts/lib/Option'
import {HeaderWithSyncStatus} from '../common/HeaderWithSyncStatus'
import {Trans} from '../common/Trans'
import {TokenList} from './TokenList'
import {TokensState, Token} from './tokens-state'
import {withStatusGuard, PropsWithWalletState} from '../common/wallet-status-guard'
import {NoWallet} from '../wallets/NoWallet'
import {LoadedState} from '../common/wallet-state'
import {AddTokenModal} from './modals/AddTokenModal'
import './Tokens.scss'

export const _Tokens = ({
  walletState,
}: PropsWithWalletState<EmptyProps, LoadedState>): JSX.Element => {
  const {
    tokens,
    addToken,
    removeToken,
    sendToken,
    isValidContract,
    getTokenInfo,
  } = TokensState.useContainer()
  const {addTokensToTrack, addTokenToTrack, estimateCallFee, getOverviewProps} = walletState

  const {availableBalance} = getOverviewProps()

  const [showAddToken, setShowAddToken] = useState(false)

  useEffect(() => addTokensToTrack(Object.keys(tokens)), [])

  const orderedTokens = _.sortBy<Token>('symbol')(_.values(tokens))

  const onAddToken = async (token: Token): Promise<void> => {
    await addToken(token)
    addTokenToTrack(token.address)
    setShowAddToken(false)
  }

  return (
    <div className="Tokens">
      <HeaderWithSyncStatus>
        <Trans k={['title', 'tokens']} />
      </HeaderWithSyncStatus>
      <div className="content">
        <div className="toolbar">
          <Button type="primary" className="action" onClick={() => setShowAddToken(true)}>
            <Trans k={['tokens', 'button', 'addToken']} />
          </Button>
        </div>
        <TokenList
          tokens={orderedTokens}
          accounts={walletState.accounts}
          onRemoveToken={removeToken}
          sendToken={sendToken}
          estimateCallFee={estimateCallFee}
          sendDisabled={pipe(
            availableBalance,
            fold(
              () => true,
              (value) => value.isZero(),
            ),
          )}
        />
      </div>
      <AddTokenModal
        visible={showAddToken}
        onAddToken={onAddToken}
        isValidContract={isValidContract}
        getTokenInfo={getTokenInfo}
        onCancel={() => setShowAddToken(false)}
      />
    </div>
  )
}

export const Tokens = withStatusGuard(_Tokens, 'LOADED', () => {
  return (
    <div className="Tokens">
      <HeaderWithSyncStatus>
        <Trans k={['title', 'tokens']} />
      </HeaderWithSyncStatus>
      <div className="content">
        <NoWallet />
      </div>
    </div>
  )
})
