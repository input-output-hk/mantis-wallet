import React, {useState} from 'react'
import BigNumber from 'bignumber.js'
import {GlacierState, AuthorizationSignature} from '../glacier-state'
import {ETC_CHAIN} from '../glacier-config'
import {validateEthPrivateKey, toAntValidator} from '../../common/util'
import {DialogApproval} from '../../common/dialog/DialogApproval'
import {DialogMessage} from '../../common/dialog/DialogMessage'
import {DisplayChain} from '../../pob/chains'
import {wrapWithModal, ModalLocker} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogInput} from '../../common/dialog/DialogInput'
import {DialogShowDust} from '../../common/dialog/DialogShowDust'
import {UNLOCK_BUTTON_TEXT, SHOULD_KEEP_OPEN_TEXT} from './claim-with-strings'
import {Asset} from './Asset'
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

  const modalLocker = ModalLocker.useContainer()

  return (
    <Dialog
      title="Claim Dust with Private Key"
      rightButtonProps={{
        children: UNLOCK_BUTTON_TEXT,
        type: 'default',
        onClick: async () => {
          const signature = await authorizationSign(transparentAddress, etcPrivateKey)
          onNext(signature)
        },
      }}
      leftButtonProps={{
        doNotRender: true,
      }}
      onSetLoading={modalLocker.setLocked}
      type="dark"
      buttonDisplayMode="wide"
    >
      <DialogInput
        id="private-key-input"
        label={`${chain.symbol} Private Key from your ${chain.symbol} Wallet `}
        onChange={(e): void => setEtcPrivateKey(e.target.value.toLowerCase())}
        formItem={{
          name: 'private-key-input',
          rules: [toAntValidator(validateEthPrivateKey)],
        }}
        autoFocus
      />
      <Asset amount={externalAmount} chain={chain}>
        Asset
      </Asset>
      <DialogShowDust amount={minimumDustAmount}>
        Estimated Dust <span className="note">(The minimum amount of Dust you’ll get)</span>
      </DialogShowDust>
      <DialogMessage label="Destination Address" description={transparentAddress} />
      <DialogApproval id="should-keep-open-checkbox" description={SHOULD_KEEP_OPEN_TEXT} />
    </Dialog>
  )
}

export const ClaimWithKey = wrapWithModal(_ClaimWithKey, 'ClaimWith')
