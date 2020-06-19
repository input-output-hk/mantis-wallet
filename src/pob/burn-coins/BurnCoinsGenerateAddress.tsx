import React, {useState} from 'react'
import SVG from 'react-inlinesvg'
import BigNumber from 'bignumber.js'
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
import {DEFAULT_PROVER_FEE} from '../pob-config'
import './BurnCoinsGenerateAddress.scss'

interface BurnCoinsGenerateAddressProps {
  chain: Chain
  provers: Prover[]
  transparentAddresses: string[]
  cancel: () => void
  generateBurnAddress: (prover: Prover, midnightAddress: string, fee: number) => Promise<void>
}

export const BurnCoinsGenerateAddress: React.FunctionComponent<BurnCoinsGenerateAddressProps> = ({
  chain,
  provers,
  transparentAddresses,
  cancel,
  generateBurnAddress,
}: BurnCoinsGenerateAddressProps) => {
  const compatibleProvers = provers.filter((p) => p.rewards[chain.id] !== undefined)
  const [prover, setProver] = useState(compatibleProvers[0])
  const minFee = UNITS[chain.unitType].fromBasic(new BigNumber(prover?.rewards[chain.id] || 0))
  const defaultFee = minFee.isLessThan(DEFAULT_PROVER_FEE) ? DEFAULT_PROVER_FEE : minFee
  const minValue = UNITS[chain.unitType].fromBasic(new BigNumber(1))
  const [fee, setFee] = useState(defaultFee.toString(10))
  const [transparentAddress, setTransparentAddress] = useState(transparentAddresses[0])

  const feeError = validateAmount(fee, [
    isGreaterOrEqual(minFee),
    hasAtMostDecimalPlaces(minValue.dp()),
  ])

  const disableGenerate = !!feeError || compatibleProvers.length === 0

  const title = (
    <>
      Token Exchange Rate: 1 {chain.symbol} <SVG src={exchangeIcon} className="svg" /> 1 M-
      {chain.symbol}
    </>
  )

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
              throw new Error('No prover was selected.')
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
          type="small"
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
        <DialogInput
          autoFocus
          id="generate-burn-fee"
          label={`Assign reward in M-${chain.symbol} for your prover`}
          value={fee}
          onChange={(e) => setFee(e.target.value)}
          errorMessage={feeError}
        />
        <DialogMessage
          description={
            <Link href={LINKS.proverListMetrics} styled>
              See Prover List Metrics
            </Link>
          }
        />
        <DialogApproval
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
    </div>
  )
}
