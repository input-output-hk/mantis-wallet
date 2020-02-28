import React, {useState} from 'react'
import SVG from 'react-inlinesvg'
import {Dialog} from '../../common/Dialog'
import {useIsMounted} from '../../common/hook-utils'
import {DialogError} from '../../common/dialog/DialogError'
import {DialogDropdown} from '../../common/dialog/DialogDropdown'
import {ProverConfig} from '../../config/type'
import {Chain} from '../chains'
import {DialogInput} from '../../common/dialog/DialogInput'
import {DialogApproval} from '../../common/dialog/DialogApproval'
import {validateAmount} from '../../common/util'
import exchangeIcon from '../../assets/icons/exchange.svg'
import './BurnCoinsGenerateAddress.scss'
import {DialogMessage} from '../../common/dialog/DialogMessage'

interface BurnCoinsGenerateAddressProps {
  chain: Chain
  provers: ProverConfig[]
  transparentAddresses: string[]
  cancel: () => void
  generateBurnAddress: (prover: ProverConfig, midnightAddress: string, fee: number) => Promise<void>
}

export const BurnCoinsGenerateAddress: React.FunctionComponent<BurnCoinsGenerateAddressProps> = ({
  chain,
  provers,
  transparentAddresses,
  cancel,
  generateBurnAddress,
}: BurnCoinsGenerateAddressProps) => {
  const [prover, setProver] = useState(provers[0])
  const [fee, setFee] = useState(prover?.reward.toString(10) || '1')
  const [transparentAddress, setTransparentAddress] = useState(transparentAddresses[0])
  const [approval, setApproval] = useState(false)

  const [inProgress, setInProgress] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const mounted = useIsMounted()

  const errors = errorMessage && <DialogError>{errorMessage}</DialogError>

  const disableGenerate = !!validateAmount(fee) || !approval

  return (
    <div className="BurnCoinsGenerateAddress">
      <Dialog
        prevButtonProps={{onClick: cancel}}
        nextButtonProps={{
          children: `Generate ${chain.symbol} Address`,
          onClick: async (): Promise<void> => {
            if (mounted.current) setInProgress(true)
            try {
              if (prover) {
                await generateBurnAddress(prover, transparentAddress, Number())
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
        <div className="exchange">
          0.1 {chain.symbol} <SVG src={exchangeIcon} className="svg" /> 0.1 M-{chain.symbol}
        </div>
        <DialogDropdown
          label="Select Receive Address"
          options={transparentAddresses}
          onChange={setTransparentAddress}
        />
        <DialogDropdown
          type="small"
          label="Prover"
          options={provers.map((prover) => ({
            key: prover.address,
            label: `${prover.name} (${prover.address})`,
          }))}
          onChange={(proverAddress) => {
            const prover = provers.find(({address}) => proverAddress === address)
            if (prover) {
              setProver(prover)
              setFee(prover.reward.toString(10))
            }
          }}
        />
        <DialogInput
          label="Assign reward for your prover"
          value={fee}
          onChange={(e) => setFee(e.target.value)}
          errorMessage={validateAmount(fee)}
        />
        <DialogMessage description="www.prover_list_metrics" />
        <DialogApproval
          checked={approval}
          onChange={setApproval}
          description={
            <>
              This will generate a {chain.name} Address to which you can send {chain.name} to be
              burned and converted into Midnight Tokens. these Midnight Tokens can be used to
              participate in an Auction to win spendable Dust Tokens. The Burn process is
              irreversible and the {chain.name} burned will be unspendable forever.
              <br />
              <br />I understand the process
            </>
          }
        />
      </Dialog>
    </div>
  )
}
