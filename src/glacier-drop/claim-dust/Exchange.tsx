import React, {useState} from 'react'
import BigNumber from 'bignumber.js'
import {ModalProps} from 'antd/lib/modal'
import {DisplayChain, DUST_SYMBOL} from '../../pob/chains'
import {wrapWithModal} from '../../common/LunaModal'
import {ShortNumber} from '../../common/ShortNumber'
import {Dialog} from '../../common/Dialog'
import {DialogApproval} from '../../common/dialog/DialogApproval'
import {DialogDropdown} from '../../common/dialog/DialogDropdown'
import {DialogShowDust} from '../../common/dialog/DialogShowDust'
import {LINKS} from '../../external-link-config'
import {Link} from '../../common/Link'
import {Asset} from './Asset'
import {ETC_CHAIN} from '../glacier-config'
import './Exchange.scss'

interface ExchangeProps {
  externalAmount: BigNumber
  minimumDustAmount: BigNumber
  availableDust: BigNumber
  transparentAddresses: string[]
  onNext: (transparentAddress: string) => void
  chain?: DisplayChain
}

const _Exchange = ({
  externalAmount,
  minimumDustAmount,
  availableDust,
  transparentAddresses,
  onNext,
  chain = ETC_CHAIN,
}: ExchangeProps & ModalProps): JSX.Element => {
  const [transparentAddress, setTransparentAddress] = useState(transparentAddresses[0])
  const [extrernalBalanceConfirmed, setExternalBalanceConfirmed] = useState<boolean>(false)
  const [midnightBalanceConfirmed, setMidnightBalanceConfirmed] = useState<boolean>(false)
  const disabled = !extrernalBalanceConfirmed || !midnightBalanceConfirmed || !transparentAddress

  return (
    <Dialog
      title="Claim Dust"
      rightButtonProps={{
        children: 'Go to Unlocking',
        type: 'default',
        onClick: () => {
          onNext(transparentAddress)
        },
        disabled,
      }}
      leftButtonProps={{
        doNotRender: true,
      }}
      type="dark"
    >
      <Asset amount={externalAmount} chain={chain}>
        {chain.symbol} Balance
      </Asset>
      <DialogShowDust amount={minimumDustAmount}>You are eligible for at least</DialogShowDust>
      <DialogApproval
        id="confirm-balance"
        description={`Confirm ${chain.symbol} Balance OK`}
        checked={extrernalBalanceConfirmed}
        onChange={setExternalBalanceConfirmed}
        autoFocus
      />
      <DialogDropdown
        label="Midnight Transparent Address"
        options={transparentAddresses}
        onChange={setTransparentAddress}
      />
      <DialogApproval
        id="confirm-fee"
        description="I understand"
        checked={midnightBalanceConfirmed}
        onChange={setMidnightBalanceConfirmed}
      >
        <div className="dust-balance">
          <div className="message">
            To complete the Unlocking of Dust and 1 Withdrawal Transaction, you will require est 0.5
            (0.25X2). Please, ensure you have an available balance to cover these fees.
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
