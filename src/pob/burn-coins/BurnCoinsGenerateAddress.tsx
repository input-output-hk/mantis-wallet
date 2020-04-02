import React, {useState} from 'react'
import SVG from 'react-inlinesvg'
import BigNumber from 'bignumber.js'
import {Dialog} from '../../common/Dialog'
import {useIsMounted} from '../../common/hook-utils'
import {DialogError} from '../../common/dialog/DialogError'
import {DialogDropdown} from '../../common/dialog/DialogDropdown'
import {DialogMessage} from '../../common/dialog/DialogMessage'
import {Chain} from '../chains'
import {DialogInput} from '../../common/dialog/DialogInput'
import {DialogApproval} from '../../common/dialog/DialogApproval'
import {validateAmount, hasAtMostDecimalPlaces, isGreaterOrEqual} from '../../common/util'
import {Prover} from '../pob-state'
import exchangeIcon from '../../assets/icons/exchange.svg'
import {UNITS} from '../../common/units'
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
  const minValue = UNITS[chain.unitType].fromBasic(new BigNumber(1))
  const [fee, setFee] = useState(minFee.toString(10))
  const [transparentAddress, setTransparentAddress] = useState(transparentAddresses[0])
  const [approval, setApproval] = useState(false)

  const [inProgress, setInProgress] = useState(false)
  const [errorMessage, setErrorMessage] = useState(
    compatibleProvers.length === 0
      ? 'No compatible provers found. Please select different token.'
      : '',
  )

  const mounted = useIsMounted()

  const errors = errorMessage && <DialogError>{errorMessage}</DialogError>
  const feeError = validateAmount(fee, [
    isGreaterOrEqual(minFee),
    hasAtMostDecimalPlaces(minValue.dp()),
  ])

  const disableGenerate = !!feeError || !approval

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
        leftButtonProps={{onClick: cancel}}
        rightButtonProps={{
          children: `Generate ${chain.symbol} Address`,
          onClick: async (): Promise<void> => {
            if (mounted.current) setInProgress(true)
            try {
              if (prover) {
                await generateBurnAddress(
                  prover,
                  transparentAddress,
                  Number(UNITS[chain.unitType].toBasic(fee)),
                )
              } else {
                setErrorMessage('No prover was selected.')
              }
            } catch (e) {
              if (mounted.current) setErrorMessage(e.message)
            } finally {
              if (mounted.current) setInProgress(false)
            }
          },
          loading: inProgress,
          disabled: disableGenerate,
        }}
        footer={errors}
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
        />
        <DialogInput
          label={`Assign reward in M-${chain.symbol} for your prover`}
          value={fee}
          onChange={(e) => setFee(e.target.value)}
          errorMessage={feeError}
        />
        <DialogMessage description="www.prover_list_metrics" />
        <DialogApproval
          checked={approval}
          onChange={setApproval}
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
