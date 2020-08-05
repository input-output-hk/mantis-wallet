import React, {useState} from 'react'
import BigNumber from 'bignumber.js'
import {ModalProps} from 'antd/lib/modal'
import {fromWei} from 'web3/lib/utils/utils.js'
import {DisplayChain, DUST_SYMBOL} from '../../pob/chains'
import {wrapWithModal} from '../../common/LunaModal'
import {ShortNumber} from '../../common/ShortNumber'
import {Dialog} from '../../common/Dialog'
import {DialogApproval} from '../../common/dialog/DialogApproval'
import {DialogDropdown} from '../../common/dialog/DialogDropdown'
import {DialogShowDust} from '../../common/dialog/DialogShowDust'
import {DialogError} from '../../common/dialog/DialogError'
import {LINKS} from '../../external-link-config'
import {Link} from '../../common/Link'
import {ETC_CHAIN} from '../glacier-config'
import {Asset} from './Asset'
import './Exchange.scss'

interface ExchangeProps {
  minimumThreshold: BigNumber
  externalAmount: BigNumber
  minimumDustAmount: BigNumber
  availableDust: BigNumber
  transparentAddresses: string[]
  onNext: (transparentAddress: string) => void
  chain?: DisplayChain
}

const _Exchange = ({
  minimumThreshold,
  externalAmount,
  minimumDustAmount,
  availableDust,
  transparentAddresses,
  onNext,
  onCancel,
  chain = ETC_CHAIN,
}: ExchangeProps & ModalProps): JSX.Element => {
  const [transparentAddress, setTransparentAddress] = useState(transparentAddresses[0])

  const externalBalanceTooLowError = externalAmount.isLessThan(minimumThreshold)
    ? `${chain.symbol} account balance should be at least ${fromWei(minimumThreshold)} ${
        chain.symbol
      }`
    : ''

  const globalErrorElem = externalBalanceTooLowError && (
    <DialogError>{externalBalanceTooLowError}</DialogError>
  )

  const disabled = !transparentAddress || externalBalanceTooLowError !== ''

  return (
    <Dialog
      title="Claim Dust"
      rightButtonProps={{
        children: 'Go to Unlocking',
        onClick: () => {
          onNext(transparentAddress)
        },
        disabled,
      }}
      leftButtonProps={{
        children: 'Cancel',
        onClick: onCancel,
      }}
      type="dark"
      helpURL={LINKS.aboutGlacier}
      footer={globalErrorElem}
    >
      <Asset amount={externalAmount} chain={chain}>
        {chain.symbol} Balance
      </Asset>
      <DialogShowDust amount={minimumDustAmount}>You are eligible for at least</DialogShowDust>
      <DialogApproval
        id="confirm-balance"
        description={`Confirm ${chain.symbol} Balance OK`}
        autoFocus
      />
      <DialogDropdown
        label="Midnight Transparent Address"
        options={transparentAddresses}
        onChange={setTransparentAddress}
      />
      <DialogApproval id="confirm-fee" description="I understand">
        <div className="dust-balance">
          <div className="message">
            To complete the Unlocking of Dust and 1 Withdrawal Transaction, you will require est 0.5
            (0.25*2) Dust. Please, ensure you have an available balance to cover these fees.
          </div>
          <span className="label">Currently Available Dust</span>
          <span className="amount">
            <ShortNumber big={availableDust} /> {DUST_SYMBOL}
          </span>
        </div>
      </DialogApproval>
      <div className="get-dust">
        <Link href={LINKS.faucet}>get dust</Link>
      </div>
    </Dialog>
  )
}

export const Exchange = wrapWithModal(_Exchange, 'Exchange')
