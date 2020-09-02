import React, {FunctionComponent, useState} from 'react'
import BigNumber from 'bignumber.js'
import {wrapWithModal, ModalOnCancel, ModalLocker} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {Token, TokensData} from '../tokens-state'
import {Trans} from '../../common/Trans'
import {LoadedState, TransparentAccount, FeeEstimates} from '../../common/wallet-state'
import {DialogDropdown} from '../../common/dialog/DialogDropdown'
import {useTranslation, useFormatters} from '../../settings-state'
import {DialogInput} from '../../common/dialog/DialogInput'
import {BackendState, getNetworkTagOrTestnet} from '../../common/backend-state'
import {
  toAntValidator,
  createTransparentAddressValidator,
  validateAmount,
  isGreater,
  hasAtMostDecimalPlaces,
  areFundsEnough,
  validateFee,
  translateValidationResult,
} from '../../common/util'
import {useAsyncUpdate} from '../../common/hook-utils'
import {DialogFee} from '../../common/dialog/DialogFee'
import {getSendTokenParams, formatTokenAmount} from '../tokens-utils'
import {UNITS} from '../../common/units'

interface SendTokenModalProps extends ModalOnCancel {
  estimateCallFee: LoadedState['estimateCallFee']
  onSendToken: TokensData['sendToken']
  accounts: TransparentAccount[]
  defaultAccount: TransparentAccount
  token: Token
}

const SendTokenDialog: FunctionComponent<SendTokenModalProps> = ({
  estimateCallFee,
  onSendToken,
  token,
  accounts,
  defaultAccount,
  onCancel,
}: SendTokenModalProps) => {
  const {t} = useTranslation()
  const {abbreviateAmount} = useFormatters()
  const modalLocker = ModalLocker.useContainer()
  const networkTag = getNetworkTagOrTestnet(BackendState.useContainer().networkTag)

  const [account, setAccount] = useState(defaultAccount)
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('0')
  const [fee, setFee] = useState('0')

  const availableBalance = account.tokens[token.address] ?? new BigNumber(0)

  const addressValidator = toAntValidator(t, createTransparentAddressValidator(networkTag))
  const txAmountValidator = toAntValidator(t, (decimals?: string) =>
    validateAmount(decimals || '', [
      isGreater(),
      hasAtMostDecimalPlaces(token.decimals),
      areFundsEnough(availableBalance, token.decimals),
    ]),
  )
  const feeValidationResult = validateFee(fee)

  const [feeEstimates, feeEstimateError, isFeeEstimationPending] = useAsyncUpdate(
    (): Promise<FeeEstimates> =>
      estimateCallFee(
        getSendTokenParams(
          token,
          account.address,
          recipient || account.address,
          new BigNumber(amount),
        ),
      ),
    [amount, recipient, networkTag],
    async (): Promise<void> => {
      if (amount !== '0') {
        await txAmountValidator.validator({}, amount)
      }
      if (recipient !== '') {
        await addressValidator.validator({}, recipient)
      }
    },
  )

  const sendDisabled = feeValidationResult !== 'OK' || !feeEstimates

  return (
    <Dialog
      title={<Trans k={['tokens', 'title', 'sendToken']} values={{tokenSymbol: token.symbol}} />}
      leftButtonProps={{
        onClick: onCancel,
      }}
      rightButtonProps={{
        children: <Trans k={['tokens', 'button', 'sendToken']} />,
        onClick: () =>
          onSendToken(
            token,
            account.address,
            recipient,
            new BigNumber(amount),
            UNITS.Dust.toBasic(new BigNumber(fee)),
          ),
        disabled: sendDisabled,
      }}
      onSetLoading={modalLocker.setLocked}
    >
      <DialogDropdown
        label={t(['tokens', 'label', 'transparentAddress'])}
        options={accounts.map((ta) => ta.address)}
        onChange={(address) => {
          const account = accounts.find((ta) => ta.address === address)
          if (account) setAccount(account)
        }}
      />
      <DialogInput
        disabled
        label={t(['tokens', 'label', 'availableAmount'])}
        value={formatTokenAmount(abbreviateAmount, token, availableBalance)}
      />
      <DialogInput
        autoFocus
        label={t(['tokens', 'label', 'recipient'])}
        onChange={(e): void => setRecipient(e.target.value)}
        formItem={{
          name: 'send-token-recipient',
          rules: [addressValidator],
        }}
      />
      <DialogInput
        label={t(['tokens', 'label', 'transactionAmount'], {replace: {tokenSymbol: token.symbol}})}
        onChange={(e): void => setAmount(e.target.value)}
        formItem={{
          name: 'send-token-amount',
          initialValue: amount,
          rules: [txAmountValidator],
        }}
      />
      <DialogFee
        label={t(['tokens', 'label', 'transactionFee'])}
        feeEstimates={feeEstimates}
        feeEstimateError={feeEstimateError}
        onChange={setFee}
        errorMessage={translateValidationResult(t, feeValidationResult)}
        isPending={isFeeEstimationPending}
      />
    </Dialog>
  )
}

export const SendTokenModal = wrapWithModal(SendTokenDialog)
