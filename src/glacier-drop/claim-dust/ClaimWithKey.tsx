import React, {useState} from 'react'
import BigNumber from 'bignumber.js'
import {GlacierState, AuthorizationSignature} from '../glacier-state'
import {validateEthPrivateKey, toAntValidator} from '../../common/util'
import {DialogApproval} from '../../common/dialog/DialogApproval'
import {DialogMessage} from '../../common/dialog/DialogMessage'
import {GdChain, ETC_CHAIN} from '../gd-chains'
import {wrapWithModal, ModalLocker} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogInput} from '../../common/dialog/DialogInput'
import {DialogShowDust} from '../../common/dialog/DialogShowDust'
import {LINKS} from '../../external-link-config'
import {Asset} from './Asset'
import {useTranslation} from '../../settings-state'
import {Trans} from '../../common/Trans'
import './ClaimWith.scss'

interface ClaimWithKeyProps {
  externalAmount: BigNumber
  minimumDustAmount: BigNumber
  transparentAddress: string
  onNext: (signature: AuthorizationSignature) => void
  chain?: GdChain
}

const _ClaimWithKey = ({
  externalAmount,
  minimumDustAmount,
  transparentAddress,
  onNext,
  chain = ETC_CHAIN,
}: ClaimWithKeyProps): JSX.Element => {
  const {authorizationSign} = GlacierState.useContainer()
  const {t} = useTranslation()

  const [etcPrivateKey, setEtcPrivateKey] = useState<string>('')

  const modalLocker = ModalLocker.useContainer()

  return (
    <Dialog
      title={t(['glacierDrop', 'title', 'claimDustWithPrivateKey'])}
      rightButtonProps={{
        children: t(['glacierDrop', 'button', 'unlockAndInitiatePoW']),
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
      helpURL={LINKS.aboutGlacier}
    >
      <DialogInput
        id="private-key-input"
        label={t(chain.translations.privateKeyLabelLong)}
        onChange={(e): void => setEtcPrivateKey(e.target.value.toLowerCase())}
        formItem={{
          name: 'private-key-input',
          rules: [toAntValidator(t, validateEthPrivateKey)],
        }}
        autoFocus
      />
      <Asset amount={externalAmount} chain={chain}>
        <Trans k={['glacierDrop', 'label', 'asset']} />
      </Asset>
      <DialogShowDust amount={minimumDustAmount}>
        <Trans k={['glacierDrop', 'label', 'estimatedDust']} />{' '}
        <span className="note">
          (<Trans k={['glacierDrop', 'message', 'estimatedDustNote']} />)
        </span>
      </DialogShowDust>
      <DialogMessage label="Destination Address">{transparentAddress}</DialogMessage>
      <DialogApproval
        id="should-keep-open-checkbox"
        description={t(['glacierDrop', 'message', 'shouldKeepLunaOpenWhileUnlocking'])}
      />
    </Dialog>
  )
}

export const ClaimWithKey = wrapWithModal(_ClaimWithKey, 'ClaimWith')
