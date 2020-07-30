import React, {useState, useEffect, useRef, FunctionComponent} from 'react'
import SVG from 'react-inlinesvg'
import BigNumber from 'bignumber.js'
import {Popover, Button, Input} from 'antd'
import {Dialog} from '../../common/Dialog'
import {DialogDropdown} from '../../common/dialog/DialogDropdown'
import {DialogMessage} from '../../common/dialog/DialogMessage'
import {Chain} from '../chains'
import {DialogInput} from '../../common/dialog/DialogInput'
import {DialogApproval} from '../../common/dialog/DialogApproval'
import {LINKS} from '../../external-link-config'
import {Link} from '../../common/Link'
import {validateAmount, hasAtMostDecimalPlaces, isGreaterOrEqual} from '../../common/util'
import {Prover} from '../pob-state'
import exchangeIcon from '../../assets/icons/exchange.svg'
import {UNITS} from '../../common/units'
import {LunaModal} from '../../common/LunaModal'
import './BurnCoinsGenerateAddress.scss'

interface BurnCoinsGenerateAddressProps {
  chain: Chain
  provers: Prover[]
  transparentAddresses: string[]
  cancel: () => void
  generateBurnAddress: (prover: Prover, midnightAddress: string, fee: number) => Promise<void>
}

const feeTooltip =
  'This is a fee in Midnight Tokens that is the Prover reward and will be taken from your total burned amount.'

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
      title="Change Prover Reward"
      leftButtonProps={{onClick: onCancel}}
      rightButtonProps={{children: 'I understand', onClick: onApprove}}
    >
      <DialogMessage type="highlight">
        {feeTooltip}
        <br />
        <br />
        <b>Warning:</b> If the fee is larger than burn amount, the burn will fail and cannot be
        recovered. Under such conditions, <b>you will lose your source fund</b>.
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
      : validateAmount(fee, [isGreaterOrEqual(minFee), hasAtMostDecimalPlaces(minValue.dp())])

  const disableGenerate = !!feeError || compatibleProvers.length === 0

  const title = (
    <>
      Token Exchange Rate: 1 {chain.symbol} <SVG src={exchangeIcon} className="svg" /> 1 M-
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
        leftButtonProps={{children: '← Go Back', onClick: cancel}}
        rightButtonProps={{
          children: `Generate ${chain.symbol} Address`,
          onClick: async (): Promise<void> => {
            if (prover) {
              await generateBurnAddress(
                prover,
                transparentAddress,
                Number(UNITS[chain.unitType].toBasic(fee)),
              )
            } else {
              throw Error('No prover was selected.')
            }
          },
          name: 'generate-burn',
          disabled: disableGenerate,
        }}
      >
        <DialogDropdown
          label="Select Receive Address"
          options={transparentAddresses}
          onChange={setTransparentAddress}
        />
        <DialogDropdown
          label="Prover"
          options={compatibleProvers.map((prover) => ({
            key: prover.address,
            label: `${prover.name} (${prover.address})`,
          }))}
          onChange={(proverAddress) => {
            const prover = compatibleProvers.find(({address}) => proverAddress === address)
            if (prover) setProver(prover)
          }}
          noOptionsMessage="No available provers for this token at the moment."
        />
        <div className="fee-container">
          <label className="label" htmlFor="generate-burn-fee">
            <Popover content={feeTooltip}>
              <span>
                Assign reward in M-{chain.symbol} for your prover{' '}
                <span style={{textTransform: 'none'}}>(What is this?)</span>
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
              Change Reward
            </Button>
          )}
        </div>
        <DialogMessage>
          <Link href={LINKS.proverListMetrics} styled>
            See Prover List Metrics
          </Link>
        </DialogMessage>
        <DialogApproval
          autoFocus
          id="i-understand-the-process-checkbox"
          description={
            <>
              This will generate a {chain.name} Address to which you can send {chain.name} to be
              burned and converted into Midnight Tokens. These Midnight Tokens can be used to
              participate in an Auction to win spendable Dust Tokens.{' '}
              <b>
                The Burn process is irreversible and the {chain.name} Tokens burned will be
                unspendable forever.
              </b>
              <br />
              <br />I understand the process
            </>
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
