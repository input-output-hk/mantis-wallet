import React, {useState} from 'react'
import SVG from 'react-inlinesvg'
import Big from 'big.js'
import {Button} from 'antd'
import _ from 'lodash'
import {ShortNumber} from '../common/ShortNumber'
import {Transaction, TransparentAddress} from '../web3'
import {SendTransaction} from './modals/SendTransaction'
import {ReceiveTransaction} from './modals/ReceiveTransaction'
import dustLogo from '../assets/dust_logo.png'
import incomingIcon from '../assets/icons/incoming.svg'
import outgoingIcon from '../assets/icons/outgoing.svg'
import confidentialIcon from '../assets/icons/confidential.svg'
import checkIcon from '../assets/icons/check.svg'
import arrowDownIcon from '../assets/icons/arrow-down.svg'
import './TransactionHistory.scss'
import {WalletState} from '../common/wallet-state'

interface TransactionHistoryProps {
  transactions: Transaction[]
  transparentAddresses: TransparentAddress[]
}

export const TransactionHistory = (props: TransactionHistoryProps): JSX.Element => {
  const {transactions, transparentAddresses} = props
  const [showSendModal, setShowSendModal] = useState(false)
  const [showReceiveModal, setShowReceiveModal] = useState(false)

  const walletState = WalletState.useContainer()

  const accounts = [
    'longprivatekey',
    'llllllllloooooooooooooonnnnnnnnnnnnggeeeeeeeeeeeeeeeeeeeeeeeeeeerrpprriivvaatteekkeeyy',
  ]

  return (
    <div className="TransactionHistory">
      <div className="toolbar">
        <div className="title">Transaction History</div>
        <div className="line"></div>
        <div>
          <span className="sort-by">Sort by ▼</span>
          <Button type="primary" className="action" onClick={(): void => setShowSendModal(true)}>
            Send
          </Button>
          <Button type="primary" className="action" onClick={(): void => setShowReceiveModal(true)}>
            Receive
          </Button>
          <SendTransaction
            visible={showSendModal}
            accounts={accounts}
            onCancel={(): void => setShowSendModal(false)}
          />
          <ReceiveTransaction
            visible={showReceiveModal}
            transparentAddresses={transparentAddresses}
            onCancel={(): void => setShowReceiveModal(false)}
            onGenerateNew={async (): Promise<void> => {
              if (walletState.walletStatus === 'LOADED') {
                await walletState.generateNewAddress()
              }
            }}
          />
        </div>
      </div>
      {transactions.length === 0 && (
        <div className="no-transactions">
          <div className="no-transactions-text">You haven&apos;t made a transaction</div>
        </div>
      )}
      {transactions.length > 0 && (
        <div className="transactions-container">
          <table className="transactions">
            <thead>
              <tr className="header">
                <th></th>
                <th>Asset</th>
                <th>Amount</th>
                <th>Time</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.hash}>
                  <td className="line">
                    <span className="type-icon">
                      &nbsp;
                      {/* FIXME: determine transaction type */}
                      <SVG src={confidentialIcon} className="svg" />
                      {/* {transaction.type === 'public' && (
                        <SVG src={transparentIcon} className="svg" />
                      )}
                      {transaction.type === 'private' && (
                        <SVG src={confidentialIcon} className="svg" />
                      )} */}
                    </span>
                  </td>
                  <td className="line">
                    <img src={dustLogo} alt="dust" className="dust" />
                    <span>DUST</span>
                  </td>
                  <td className="line">
                    <span className="amount">
                      {transaction.txDirection === 'incoming' && (
                        <SVG src={incomingIcon} className="svg" />
                      )}
                      {transaction.txDirection === 'outgoing' && (
                        <SVG src={outgoingIcon} className="svg" />
                      )}
                      &nbsp;
                      <ShortNumber big={Big(parseInt(transaction.txValue))} />
                    </span>
                  </td>
                  {/* FIXME: get proper date from transaction */}
                  <td className="line">{transaction.txStatus.atBlock}</td>
                  <td className="line">
                    {transaction.txStatus.status === 'confirmed' && (
                      <>
                        <SVG src={checkIcon} className="check" />
                        &nbsp;
                      </>
                    )}
                    {_.capitalize(transaction.txStatus.status)}
                  </td>
                  <td className="line">
                    <SVG src={arrowDownIcon} className="svg" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
