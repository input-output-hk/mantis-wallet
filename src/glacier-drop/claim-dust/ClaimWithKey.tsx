import React, {useState} from 'react'
import BigNumber from 'bignumber.js'
import {GlacierState, AuthorizationSignature} from '../glacier-state'
import {ETC_CHAIN} from '../glacier-config'
import {validateEthPrivateKey} from '../../common/util'
import {DialogApproval} from '../../common/dialog/DialogApproval'
import {DialogMessage} from '../../common/dialog/DialogMessage'
import {DisplayChain} from '../../pob/chains'
import {wrapWithModal, ModalLocker} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogInput} from '../../common/dialog/DialogInput'
import {Asset} from './Asset'
import {DialogShowDust} from '../../common/dialog/DialogShowDust'
import './ClaimWith.scss'

interface ClaimWithKeyProps {
  externalAmount: BigNumber
  minimumDustAmount: BigNumber
  transparentAddress: string
  onNext: (signature: AuthorizationSignature) => void
  chain?: DisplayChain
}

const _ClaimWithKey = ({
  externalAmount,
  minimumDustAmount,
  transparentAddress,
  onNext,
  chain = ETC_CHAIN,
}: ClaimWithKeyProps): JSX.Element => {
  const {authorizationSign} = GlacierState.useContainer()

  const [etcPrivateKey, setEtcPrivateKey] = useState<string>('')
  const [checked, setChecked] = useState<boolean>(false)

  const modalLocker = ModalLocker.useContainer()

  const privateKeyError = validateEthPrivateKey(etcPrivateKey)
  const disabled = privateKeyError !== '' || !checked

  return (
    <Dialog
      title="Claim Dust with Private Key"
      rightButtonProps={{
        children: 'Unlock and initiate proof of Work puzzle',
        type: 'default',
        onClick: async () => {
          const signature = await authorizationSign(transparentAddress, etcPrivateKey)
          onNext(signature)
        },
        disabled,
      }}
      leftButtonProps={{
        doNotRender: true,
      }}
      onSetLoading={modalLocker.setLocked}
      type="dark"
      buttonDisplayMode="natural"
    >
      <DialogInput
        autoFocus
        label={`${chain.symbol} Private Key from your ${chain.symbol} Wallet `}
        onChange={(e): void => setEtcPrivateKey(e.target.value.toLowerCase())}
        errorMessage={privateKeyError}
      />
      <Asset amount={externalAmount} chain={chain}>
        Asset
      </Asset>
      <DialogShowDust amount={minimumDustAmount}>
        Estimated Dust <span className="note">(The minimum amount of Dust you’ll get)</span>
      </DialogShowDust>
      <DialogMessage label="Destination Address" description={transparentAddress} />
      <DialogApproval
        description="I’m aware that I have to keep my Luna wallet open during unlocking "
        checked={checked}
        onChange={setChecked}
      />
    </Dialog>
  )
}

export const ClaimWithKey = wrapWithModal(_ClaimWithKey, 'ClaimWith')
