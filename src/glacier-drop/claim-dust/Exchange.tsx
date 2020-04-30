import React, {useState} from 'react'
import BigNumber from 'bignumber.js'
import {ModalProps} from 'antd/lib/modal'
import {DisplayChain, DUST_SYMBOL} from '../../pob/chains'
import {LunaModal} from '../../common/LunaModal'
import {ShortNumber} from '../../common/ShortNumber'
import {Dialog} from '../../common/Dialog'
import {DialogApproval} from '../../common/dialog/DialogApproval'
import {DialogDropdown} from '../../common/dialog/DialogDropdown'
import {DialogShowDust} from '../../common/dialog/DialogShowDust'
import {Asset} from './Asset'
import {ETC_CHAIN} from '../glacier-config'
import './Exchange.scss'

interface ExchangeProps {
  externalAmount: BigNumber
  minimumDustAmount: BigNumber
  availableDust: BigNumber
  transparentAddresses: string[]
  onNext: (transparentAddress: string) => void
  onCancel: () => void
  chain?: DisplayChain
}

export const Exchange = ({
  externalAmount,
  minimumDustAmount,
  availableDust,
  transparentAddresses,
  onNext,
  onCancel,
  chain = ETC_CHAIN,
  ...props
}: ExchangeProps & ModalProps): JSX.Element => {
  const [transparentAddress, setTransparentAddress] = useState(transparentAddresses[0])
  const [extrernalBalanceConfirmed, setExternalBalanceConfirmed] = useState<boolean>(false)
  const [midnightBalanceConfirmed, setMidnightBalanceConfirmed] = useState<boolean>(false)
  const disabled = !extrernalBalanceConfirmed || !midnightBalanceConfirmed || !transparentAddress

  const reset = (): void => {
    setExternalBalanceConfirmed(false)
    setMidnightBalanceConfirmed(false)
  }

  const close = (): void => {
    reset()
    onCancel()
  }

  return (
    <LunaModal destroyOnClose wrapClassName="Exchange" onCancel={close} {...props}>
      <Dialog
        title="Claim Dust"
        rightButtonProps={{
          children: 'Go to Unlocking',
          type: 'default',
          onClick: () => {
            reset()
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
          description={`Confirm ${chain.symbol} Balance OK`}
          checked={extrernalBalanceConfirmed}
          onChange={setExternalBalanceConfirmed}
        />
        <DialogDropdown
          label="Midnight Address"
          options={transparentAddresses}
          onChange={setTransparentAddress}
        />
        <DialogApproval
          description="I understand"
          checked={midnightBalanceConfirmed}
          onChange={setMidnightBalanceConfirmed}
        >
          <div className="dust-balance">
            <div className="message">
              To complete the Unlocking of Dust and 1 Withdrawal Transaction, you will require est
              0.5 (0.25X2). Please ensure you have an available balance to cover these fees.
            </div>
            <span className="label">Currently Available Dust</span>
            <span className="amount">
              <ShortNumber big={availableDust} /> {DUST_SYMBOL}
            </span>
          </div>
        </DialogApproval>
        <div className="get-dust">get dust</div>
      </Dialog>
    </LunaModal>
  )
}
