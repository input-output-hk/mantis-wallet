import React, {useState} from 'react'
import BigNumber from 'bignumber.js'
import {ModalProps} from 'antd/lib/modal'
import {GlacierState, AuthorizationSignature} from '../glacier-state'
import {ETC_CHAIN} from '../glacier-config'
import {validateEthPrivateKey} from '../../common/util'
import {DialogApproval} from '../../common/dialog/DialogApproval'
import {DialogMessage} from '../../common/dialog/DialogMessage'
import {DialogError} from '../../common/dialog/DialogError'
import {DisplayChain} from '../../pob/chains'
import {LunaModal} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogInput} from '../../common/dialog/DialogInput'
import {Asset} from './Asset'
import {DialogShowDust} from '../../common/dialog/DialogShowDust'
import './ClaimWith.scss'

interface ClaimWithKeyProps {
  externalAmount: BigNumber
  dustAmount: BigNumber
  transparentAddress: string
  onNext: (signature: AuthorizationSignature) => void
  onCancel: () => void
  chain?: DisplayChain
}

export const ClaimWithKey = ({
  externalAmount,
  dustAmount,
  transparentAddress,
  onNext,
  onCancel,
  chain = ETC_CHAIN,
  ...props
}: ClaimWithKeyProps & ModalProps): JSX.Element => {
  const {authorizationSign} = GlacierState.useContainer()

  const [etcPrivateKey, setEtcPrivateKey] = useState<string>('')
  const [checked, setChecked] = useState<boolean>(false)
  const [globalErrorMsg, setGlobalErrorMsg] = useState<string>('')

  const globalErrorElem = globalErrorMsg && <DialogError>{globalErrorMsg}</DialogError>
  const privateKeyError = validateEthPrivateKey(etcPrivateKey)
  const disabled = privateKeyError !== '' || !checked

  const reset = (): void => {
    setGlobalErrorMsg('')
    setEtcPrivateKey('')
    setChecked(false)
  }

  const close = (): void => {
    reset()
    onCancel()
  }

  return (
    <LunaModal destroyOnClose wrapClassName="ClaimWith" onCancel={close} {...props}>
      <Dialog
        title="Claim Dust with Private Key"
        rightButtonProps={{
          children: 'Unlock and initiate proof of Work puzzle',
          type: 'default',
          onClick: async () => {
            try {
              const signature = await authorizationSign(transparentAddress, etcPrivateKey)
              reset()
              onNext(signature)
            } catch (e) {
              setGlobalErrorMsg(e.message)
            }
          },
          disabled,
        }}
        leftButtonProps={{
          doNotRender: true,
        }}
        type="dark"
        buttonDisplayMode="natural"
        footer={globalErrorElem}
      >
        <DialogInput
          label={`${chain.symbol} Private Key from your ${chain.symbol} Wallet `}
          onChange={(e): void => setEtcPrivateKey(e.target.value.toLowerCase())}
          errorMessage={privateKeyError}
        />
        <Asset amount={externalAmount} chain={chain}>
          Asset
        </Asset>
        <DialogShowDust amount={dustAmount}>
          Estimated Dust <span className="note">(The minimum amount of Dust you’ll get)</span>
        </DialogShowDust>
        <DialogMessage label="Destination Address" description={transparentAddress} />
        <DialogApproval
          description="I’m aware that I have to keep my Luna wallet open during unlocking "
          checked={checked}
          onChange={setChecked}
        />
      </Dialog>
    </LunaModal>
  )
}
