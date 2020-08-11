import React, {useState} from 'react'
import BigNumber from 'bignumber.js'
import {ModalProps} from 'antd/lib/modal'
import {UNITS} from '../../common/units'
import {DST_CHAIN} from '../../common/chains'
import {GdChain, ETC_CHAIN} from '../gd-chains'
import {wrapWithModal} from '../../common/LunaModal'
import {ShortNumber} from '../../common/ShortNumber'
import {Dialog} from '../../common/Dialog'
import {DialogApproval} from '../../common/dialog/DialogApproval'
import {DialogDropdown} from '../../common/dialog/DialogDropdown'
import {DialogShowDust} from '../../common/dialog/DialogShowDust'
import {DialogError} from '../../common/dialog/DialogError'
import {LINKS} from '../../external-link-config'
import {Link} from '../../common/Link'
import {Asset} from './Asset'
import {useTranslation} from '../../settings-state'
import {Trans} from '../../common/Trans'
import './Exchange.scss'

interface ExchangeProps {
  minimumThreshold: BigNumber
  externalAmount: BigNumber
  minimumDustAmount: BigNumber
  availableDust: BigNumber
  transparentAddresses: string[]
  onNext: (transparentAddress: string) => void
  chain?: GdChain
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
  const {t} = useTranslation()
  const [transparentAddress, setTransparentAddress] = useState(transparentAddresses[0])

  const externalBalanceTooLowError = externalAmount.isLessThan(minimumThreshold)
    ? t(chain.translations.lowBalanceError, {
        replace: {amount: `${UNITS[chain.unitType].fromBasic(minimumThreshold)} ${chain.symbol}`},
      })
    : ''

  const globalErrorElem = externalBalanceTooLowError && (
    <DialogError>{externalBalanceTooLowError}</DialogError>
  )

  const disabled = !transparentAddress || externalBalanceTooLowError !== ''

  return (
    <Dialog
      title={t(['glacierDrop', 'title', 'claimDust'])}
      rightButtonProps={{
        children: t(['glacierDrop', 'button', 'goToUnlocking']),
        onClick: () => {
          onNext(transparentAddress)
        },
        disabled,
      }}
      leftButtonProps={{
        onClick: onCancel,
      }}
      type="dark"
      helpURL={LINKS.aboutGlacier}
      footer={globalErrorElem}
    >
      <Asset amount={externalAmount} chain={chain}>
        <Trans k={chain.translations.balanceLabel} />
      </Asset>
      <DialogShowDust amount={minimumDustAmount}>
        <Trans k={['glacierDrop', 'label', 'youAreEligibleDust']} />
      </DialogShowDust>
      <DialogApproval
        id="confirm-balance"
        description={t(chain.translations.confirmBalance)}
        autoFocus
      />
      <DialogDropdown
        label={t(['glacierDrop', 'label', 'midnightTransparentAddress'])}
        options={transparentAddresses}
        onChange={setTransparentAddress}
      />
      <DialogApproval
        id="confirm-fee"
        description={t(['common', 'message', 'iUnderstandApproval'])}
      >
        <div className="dust-balance">
          <div className="message">
            <Trans k={['glacierDrop', 'message', 'confirmFeeMessage']} />
          </div>
          <span className="label">
            <Trans k={['glacierDrop', 'label', 'availableDust']} />
          </span>
          <span className="amount">
            <ShortNumber big={availableDust} /> {DST_CHAIN.symbol}
          </span>
        </div>
      </DialogApproval>
      <div className="get-dust">
        <Link href={LINKS.faucet}>
          <Trans k={['glacierDrop', 'link', 'getDust']} />
        </Link>
      </div>
    </Dialog>
  )
}

export const Exchange = wrapWithModal(_Exchange, 'Exchange')
