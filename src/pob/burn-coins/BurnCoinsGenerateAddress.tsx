import React, {useState, useEffect, useRef, FunctionComponent} from 'react'
import SVG from 'react-inlinesvg'
import BigNumber from 'bignumber.js'
import {Popover, Button, Input} from 'antd'
import {Dialog} from '../../common/Dialog'
import {DialogDropdown} from '../../common/dialog/DialogDropdown'
import {DialogMessage} from '../../common/dialog/DialogMessage'
import {PobChain} from '../pob-chains'
import {DialogInput} from '../../common/dialog/DialogInput'
import {DialogApproval} from '../../common/dialog/DialogApproval'
import {LINKS} from '../../external-link-config'
import {Link} from '../../common/Link'
import {
  validateAmount,
  hasAtMostDecimalPlaces,
  isGreaterOrEqual,
  translateValidationResult,
} from '../../common/util'
import {Prover} from '../pob-state'
import exchangeIcon from '../../assets/icons/exchange.svg'
import {UNITS} from '../../common/units'
import {LunaModal} from '../../common/LunaModal'
import {useTranslation} from '../../settings-state'
import {Trans} from '../../common/Trans'
import {createTErrorRenderer} from '../../common/i18n'
import './BurnCoinsGenerateAddress.scss'

interface BurnCoinsGenerateAddressProps {
  chain: PobChain
  provers: Prover[]
  transparentAddresses: string[]
  cancel: () => void
  generateBurnAddress: (prover: Prover, midnightAddress: string, fee: number) => Promise<void>
}

const ApproveChangeReward = ({
  visible,
  onCancel,
  onApprove,
}: {
  visible: boolean
  onCancel: () => void
  onApprove: () => void
}): JSX.Element => (
  <LunaModal visible={visible} onCancel={onCancel}>
    <Dialog
      title={<Trans k={['proofOfBurn', 'title', 'changeProverReward']} />}
      leftButtonProps={{onClick: onCancel}}
      rightButtonProps={{
        children: <Trans k={['common', 'button', 'iUnderstand']} />,
        onClick: onApprove,
      }}
    >
      <DialogMessage type="highlight">
        <Trans k={['proofOfBurn', 'message', 'proverRewardTooltip']} />
        <br />
        <br />
        <Trans k={['proofOfBurn', 'message', 'proverRewardWarning']} />
      </DialogMessage>
    </Dialog>
  </LunaModal>
)

export const BurnCoinsGenerateAddress: FunctionComponent<BurnCoinsGenerateAddressProps> = ({
  chain,
  provers,
  transparentAddresses,
  cancel,
  generateBurnAddress,
}: BurnCoinsGenerateAddressProps) => {
  const {t} = useTranslation()

  const compatibleProvers = provers.filter((p) => p.rewards[chain.id] !== undefined)
  const [prover, setProver] = useState(compatibleProvers[0])

  const feeInputRef = useRef<Input>(null)
  const [isApproveChangeRewardVisible, setApproveChangeRewardVisible] = useState(false)
  const [isFeeDisabled, setFeeDisabled] = useState(true)

  const minFee = UNITS[chain.unitType].fromBasic(new BigNumber(prover?.rewards[chain.id] || 0))
  const minValue = UNITS[chain.unitType].fromBasic(new BigNumber(1))
  const [fee, setFee] = useState('')
  const [transparentAddress, setTransparentAddress] = useState(transparentAddresses[0])

  const feeError =
    compatibleProvers.length === 0
      ? '' // don't show fee errors when there are no available provers
      : translateValidationResult(
          t,
          validateAmount(fee, [isGreaterOrEqual(minFee), hasAtMostDecimalPlaces(minValue.dp())]),
        )

  const disableGenerate = !!feeError || compatibleProvers.length === 0

  const title = (
    <>
      <Trans k={['proofOfBurn', 'label', 'tokenExchangeRate']} />: 1 {chain.symbol}{' '}
      <SVG src={exchangeIcon} className="svg" /> 1 M-
      {chain.symbol}
    </>
  )

  useEffect(() => {
    if (isFeeDisabled) setFee(minFee.toString(10))
  }, [prover])

  return (
    <div className="BurnCoinsGenerateAddress">
      <Dialog
        title={title}
        leftButtonProps={{
          children: t(['common', 'button', 'goBackOneStep']),
          onClick: cancel,
        }}
        rightButtonProps={{
          children: t(chain.translations.generateAddress),
          onClick: async (): Promise<void> => {
            if (prover) {
              await generateBurnAddress(
                prover,
                transparentAddress,
                Number(UNITS[chain.unitType].toBasic(fee)),
              )
            } else {
              throw createTErrorRenderer(['proofOfBurn', 'error', 'noProverWasSelected'])
            }
          },
          name: 'generate-burn',
          disabled: disableGenerate,
        }}
      >
        <DialogDropdown
          label={t(['proofOfBurn', 'label', 'selectReceiveAddress'])}
          options={transparentAddresses}
          onChange={setTransparentAddress}
        />
        <DialogDropdown
          label={t(['proofOfBurn', 'label', 'prover'])}
          options={compatibleProvers.map((prover) => ({
            key: prover.address,
            label: `${prover.name} (${prover.address})`,
          }))}
          onChange={(proverAddress) => {
            const prover = compatibleProvers.find(({address}) => proverAddress === address)
            if (prover) setProver(prover)
          }}
          noOptionsMessage={['proofOfBurn', 'error', 'noAvailableProversForThisToken']}
        />
        <div className="fee-container">
          <label className="label" htmlFor="generate-burn-fee">
            <Popover content={<Trans k={['proofOfBurn', 'message', 'proverRewardTooltip']} />}>
              <span>
                <Trans k={chain.translations.proverRewardLabel} />{' '}
                <span style={{textTransform: 'none'}}>
                  (<Trans k={['common', 'link', 'whatIsThis']} />)
                </span>
              </span>
            </Popover>
          </label>
          <DialogInput
            disabled={isFeeDisabled}
            id="generate-burn-fee"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            errorMessage={feeError}
            ref={feeInputRef}
          />
          {isFeeDisabled && (
            <Button className="change-reward" onClick={() => setApproveChangeRewardVisible(true)}>
              <Trans k={['proofOfBurn', 'button', 'changeProverReward']} />
            </Button>
          )}
        </div>
        <DialogMessage>
          <Link href={LINKS.proverListMetrics} styled>
            <Trans k={['proofOfBurn', 'link', 'seeProverListMetrics']} />
          </Link>
        </DialogMessage>
        <DialogApproval
          autoFocus
          id="i-understand-the-process-checkbox"
          description={
            <div>
              <Trans k={chain.translations.burnDescription} />
              <br />
              <Link href={LINKS.aboutPoB} styled>
                <Trans k={['proofOfBurn', 'link', 'learnMoreAboutPoB']} />
              </Link>
            </div>
          }
        />
      </Dialog>
      <ApproveChangeReward
        onCancel={() => setApproveChangeRewardVisible(false)}
        onApprove={() => {
          setApproveChangeRewardVisible(false)
          setFeeDisabled(false)
          feeInputRef.current?.focus()
        }}
        visible={isApproveChangeRewardVisible}
      />
    </div>
  )
}
