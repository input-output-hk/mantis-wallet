import React from 'react'
import {action} from '@storybook/addon-actions'
import {ESSENTIAL_DECORATORS} from '../storybook-util/essential-decorators'
import {Tokens} from './Tokens'
import {TokenList} from './TokenList'
import {withTokensState} from '../storybook-util/tokens-state-decorator'
import {AddTokenModal} from './modals/AddTokenModal'
import {asyncAction} from '../storybook-util/custom-knobs'
import {
  estimateFeesWithRandomDelay,
  dummyERC20Tokens,
  dummyAccounts,
} from '../storybook-util/dummies'
import {HideTokenModal} from './modals/HideTokenModal'
import {ReceiveTokenModal} from './modals/ReceiveTokenModal'
import {SendTokenModal} from './modals/SendTokenModal'

export default {
  title: 'Tokens',
  decorators: [...ESSENTIAL_DECORATORS, withTokensState],
}

export const tokensOverview = (): JSX.Element => <Tokens />

export const tokenList = (): JSX.Element => (
  <TokenList
    tokens={dummyERC20Tokens}
    accounts={dummyAccounts}
    onRemoveToken={action('on-remove-token')}
    sendToken={asyncAction('send-token')}
    estimateCallFee={() => estimateFeesWithRandomDelay()}
  />
)

export const addTokenModal = (): JSX.Element => (
  <AddTokenModal
    visible
    onAddToken={asyncAction('on-add-new-token')}
    isValidContract={() => Promise.resolve(true)}
    getTokenInfo={() => Promise.resolve({})}
    onCancel={action('on-cancel')}
  />
)

export const hideTokenModal = (): JSX.Element => (
  <HideTokenModal
    visible
    token={dummyERC20Tokens[0]}
    onHideToken={action('on-hide-token')}
    onCancel={action('on-cancel')}
  />
)

export const receiveTokenModal = (): JSX.Element => (
  <ReceiveTokenModal
    visible
    token={dummyERC20Tokens[0]}
    accounts={dummyAccounts}
    onCancel={action('on-cancel')}
  />
)

export const sendTokenModal = (): JSX.Element => (
  <SendTokenModal
    visible
    token={dummyERC20Tokens[0]}
    accounts={dummyAccounts}
    defaultAccount={dummyAccounts[0]}
    onSendToken={asyncAction('on-send-token')}
    estimateCallFee={() => estimateFeesWithRandomDelay()}
    onCancel={action('on-cancel')}
  />
)
