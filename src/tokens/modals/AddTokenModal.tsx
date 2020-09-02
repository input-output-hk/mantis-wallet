import React, {useState, useEffect, FunctionComponent} from 'react'
import _ from 'lodash/fp'
import {Rule} from 'antd/lib/form'
import {ModalLocker, wrapWithModal, ModalOnCancel} from '../../common/LunaModal'
import {Dialog, DialogState} from '../../common/Dialog'
import {useTranslation} from '../../settings-state'
import {Token, TokensData} from '../tokens-state'
import {DialogInput} from '../../common/dialog/DialogInput'
import {BackendState, getNetworkTagOrTestnet} from '../../common/backend-state'
import {
  createTransparentAddressValidator,
  toAntValidator,
  validateAmount,
  isGreaterOrEqual,
  hasAtMostDecimalPlaces,
} from '../../common/util'
import {Trans} from '../../common/Trans'
import {useAsyncUpdate} from '../../common/hook-utils'

interface AddTokenModalProps extends ModalOnCancel {
  onAddToken: (token: Token) => Promise<void>
  isValidContract: TokensData['isValidContract']
  getTokenInfo: TokensData['getTokenInfo']
}

interface ContractAddressInputProps {
  setAddress: (address: string) => void
  updateInfo: (info: Partial<Token>) => void
  isValidContract: TokensData['isValidContract']
  getTokenInfo: TokensData['getTokenInfo']
}

const fieldName = (k: string): string => `token-${k}`

const ContractAddressInput = ({
  setAddress,
  updateInfo,
  isValidContract,
  getTokenInfo,
}: ContractAddressInputProps): JSX.Element => {
  const {t} = useTranslation()
  const networkTag = getNetworkTagOrTestnet(BackendState.useContainer().networkTag)
  const {dialogForm} = DialogState.useContainer()

  const [address, _setAddress] = useState('')

  const addressValidator = toAntValidator(t, createTransparentAddressValidator(networkTag))
  const contractValidator = {
    validator: async (_rule: Rule, value?: string): Promise<void> =>
      value !== undefined && (await isValidContract(value))
        ? Promise.resolve()
        : Promise.reject(t(['tokens', 'error', 'invalidERC20ContractShort'])),
  }

  const [info] = useAsyncUpdate<Partial<Token>>(async (): Promise<Partial<Token>> => {
    const validContract = address && (await isValidContract(address))
    return validContract ? getTokenInfo(address) : {}
  }, [address])

  useEffect(() => {
    if (info && !_.isEmpty(info)) {
      const prefixedInfo = _.mapKeys(fieldName, info)
      dialogForm.setFieldsValue(prefixedInfo)
      dialogForm.validateFields(_.keys(prefixedInfo))
      updateInfo(info)
    }
  }, [info])

  return (
    <DialogInput
      autoFocus
      label={<Trans k={['tokens', 'label', 'smartContractAddress']} />}
      onChange={(e): void => {
        const newAddress = e.target.value
        setAddress(newAddress)
        _setAddress(newAddress)
      }}
      formItem={{
        name: fieldName('address'),
        rules: [addressValidator, contractValidator],
      }}
    />
  )
}

const AddTokenDialog: FunctionComponent<AddTokenModalProps> = ({
  onAddToken,
  isValidContract,
  getTokenInfo,
  onCancel,
}: AddTokenModalProps) => {
  const {t} = useTranslation()
  const modalLocker = ModalLocker.useContainer()

  const [address, setAddress] = useState('')
  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [decimals, setDecimals] = useState('18')

  const decimalNumberValidator = toAntValidator(t, (decimals?: string) =>
    validateAmount(decimals || '', [isGreaterOrEqual(), hasAtMostDecimalPlaces(0)]),
  )

  return (
    <Dialog
      title={t(['tokens', 'title', 'addNewToken'])}
      leftButtonProps={{
        onClick: onCancel,
        disabled: modalLocker.isLocked,
      }}
      rightButtonProps={{
        children: t(['tokens', 'button', 'addToken']),
        onClick: async (): Promise<void> =>
          onAddToken({address, name, symbol, decimals: parseInt(decimals)}),
      }}
      onSetLoading={modalLocker.setLocked}
    >
      <ContractAddressInput
        setAddress={setAddress}
        updateInfo={(info: Partial<Token>) => {
          if (info.name != null && info.name !== name) setName(info.name)
          if (info.symbol != null && info.symbol !== symbol) setSymbol(info.symbol)
          if (info.decimals != null && `${info.decimals}` !== decimals)
            setDecimals(`${info.decimals}`)
        }}
        isValidContract={isValidContract}
        getTokenInfo={getTokenInfo}
      />
      <DialogInput
        label={t(['tokens', 'label', 'tokenName'])}
        onChange={(e): void => setName(e.target.value)}
        formItem={{
          name: fieldName('name'),
          rules: [{required: true, message: t(['tokens', 'error', 'tokenNameMustBeSet'])}],
        }}
      />
      <DialogInput
        label={t(['tokens', 'label', 'tokenSymbol'])}
        onChange={(e): void => setSymbol(e.target.value)}
        formItem={{
          name: fieldName('symbol'),
          rules: [{required: true, message: t(['tokens', 'error', 'tokenSymbolMustBeSet'])}],
        }}
      />
      <DialogInput
        label={t(['tokens', 'label', 'decimals'])}
        onChange={(e): void => setDecimals(e.target.value)}
        type="number"
        formItem={{
          name: fieldName('decimals'),
          initialValue: decimals,
          rules: [decimalNumberValidator],
        }}
      />
    </Dialog>
  )
}

export const AddTokenModal = wrapWithModal(AddTokenDialog)
