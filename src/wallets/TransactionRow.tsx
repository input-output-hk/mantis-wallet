import React from 'react'
import SVG from 'react-inlinesvg'
import Big from 'big.js'
import _ from 'lodash'
import {Transaction} from '../web3'
import {ThemeState} from '../theme-state'
import {ShortNumber} from '../common/ShortNumber'
import dustIconDark from '../assets/dark/dust.png'
import dustIconLight from '../assets/light/dust.png'
import incomingIcon from '../assets/icons/incoming.svg'
import outgoingIcon from '../assets/icons/outgoing.svg'
import transparentIcon from '../assets/icons/transparent.svg'
import confidentialIcon from '../assets/icons/confidential.svg'
import checkIcon from '../assets/icons/check.svg'
import arrowDownIcon from '../assets/icons/arrow-down.svg'

export const TransactionRow = ({transaction}: {transaction: Transaction}): JSX.Element => {
  const {txDetails, txDirection, txStatus, txValue} = transaction

  const themeState = ThemeState.useContainer()
  const dustIcon = themeState.theme === 'dark' ? dustIconDark : dustIconLight

  const value = typeof txValue === 'string' ? txValue : txValue.value
  const status = typeof txStatus === 'string' ? txStatus : txStatus.status
  const atBlock = txStatus === 'pending' || txStatus === 'failed' ? '' : txStatus.atBlock

  return (
    <tr>
      <td className="line">
        <span className="type-icon">
          &nbsp;
          {txDetails.txType === 'call' && (
            <SVG src={transparentIcon} className="svg" title="Transparent" />
          )}
          {txDetails.txType !== 'call' && (
            <SVG src={confidentialIcon} className="svg" title="Confidential" />
          )}
        </span>
      </td>
      <td className="line">
        <img src={dustIcon} alt="dust" className="dust" />
        <span>DUST</span>
      </td>
      <td className="line">
        <span className="amount">
          {txDirection === 'incoming' && (
            <SVG src={incomingIcon} className="svg" title="Incoming" />
          )}
          {txDirection === 'outgoing' && (
            <SVG src={outgoingIcon} className="svg" title="Outgoing" />
          )}
          &nbsp;
          <ShortNumber big={Big(parseInt(value))} />
        </span>
      </td>
      {/* FIXME: get proper date from transaction */}
      <td className="line">{atBlock}</td>
      <td className="line">
        {status === 'confirmed' && (
          <>
            <SVG src={checkIcon} className="check" title="Confirmed" />
            &nbsp;
          </>
        )}
        {_.capitalize(status)}
      </td>
      <td className="line">
        <SVG src={arrowDownIcon} className="svg" />
      </td>
    </tr>
  )
}
