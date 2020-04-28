import React, {useState, useEffect} from 'react'
import BigNumber from 'bignumber.js'
import {Option, none, some, getOrElse} from 'fp-ts/lib/Option'
import {EnterAddress} from './EnterAddress'
import {Exchange} from './Exchange'
import {LoadedState} from '../../common/wallet-state'
import {Claim, BalanceWithProof, AuthorizationSignature} from '../glacier-state'
import {TOTAL_ETHER_IN_SNAPSHOT} from '../glacier-config'
import {SelectMethod} from './SelectMethod'
import {VerifyAddress} from './VerifyAddress'
import {GeneratedMessage} from './GeneratedMessage'
import {ClaimWithKey} from './ClaimWithKey'
import {ClaimWithMessage} from './ClaimWithMessage'

export type ModalId =
  | 'none'
  | 'EnterAddress'
  | 'Exchange'
  | 'SelectMethod'
  | 'VerifyAddress'
  | 'GeneratedMessage'
  | 'ClaimWithKey'
  | 'ClaimWithMessage'

interface ClaimControllerProps {
  walletState: LoadedState
  totalDustDistributed: BigNumber
  activeModal: ModalId
  setActiveModal(modalId: ModalId): void
  onFinish(claim: Claim): void
}

export const ClaimController = ({
  walletState,
  totalDustDistributed,
  activeModal,
  setActiveModal,
  onFinish,
}: React.PropsWithChildren<ClaimControllerProps>): JSX.Element => {
  const {transparentAddresses, getOverviewProps} = walletState
  const {availableBalance} = getOverviewProps()

  const [externalAddress, setExternalAddress] = useState<string>('')
  const [transparentAddress, setTransparentAddress] = useState<string>('')
  const [balanceWithProofOption, setBalanceWithProof] = useState<Option<BalanceWithProof>>(none)

  const balanceWithProof = getOrElse(
    (): BalanceWithProof => ({
      balance: new BigNumber(0),
      proof: '',
    }),
  )(balanceWithProofOption)

  const minimumDustAmount = balanceWithProof.balance
    .dividedBy(TOTAL_ETHER_IN_SNAPSHOT)
    .multipliedBy(totalDustDistributed)

  useEffect(() => {
    if (activeModal === 'none') {
      setExternalAddress('')
      setTransparentAddress('')
      setBalanceWithProof(none)
    }
  }, [activeModal])

  const createClaim = (authSignature: AuthorizationSignature): Claim => {
    return {
      added: new Date(),
      puzzleStatus: 'solving',
      dustAmount: minimumDustAmount, // Final amount will be calculated after unlocking period is over
      isFinalDustAmount: false,
      transparentAddress,
      externalAddress,
      authSignature,
      externalAmount: balanceWithProof.balance,
      inclusionProof: balanceWithProof.proof,
      withdrawnDustAmount: new BigNumber(0),
      powNonce: null,
      puzzleDuration: 600, // FIXME: PM-1855 Refactor Claim Creation
      unlockTxHash: null,
      withdrawTxHashes: [],
      txStatuses: {},
    }
  }

  const onCancel = (): void => setActiveModal('none')

  const finish = (authSignature: AuthorizationSignature): void => {
    onFinish(createClaim(authSignature))
    setActiveModal('none')
  }

  return (
    <>
      <EnterAddress
        visible={activeModal === 'EnterAddress'}
        onNext={(address: string, balanceWithProof: BalanceWithProof) => {
          setBalanceWithProof(some(balanceWithProof))
          setExternalAddress(address)
          setActiveModal('Exchange')
        }}
        onCancel={onCancel}
      />
      <Exchange
        visible={activeModal === 'Exchange'}
        externalAmount={balanceWithProof.balance}
        minimumDustAmount={minimumDustAmount}
        availableDust={availableBalance}
        transparentAddresses={transparentAddresses.map(({address}: {address: string}) => address)}
        onNext={(transparentAddress: string) => {
          setTransparentAddress(transparentAddress)
          setActiveModal('SelectMethod')
        }}
        onCancel={onCancel}
      />
      <SelectMethod
        visible={activeModal === 'SelectMethod'}
        onMessageCreate={() => setActiveModal('VerifyAddress')}
        onPrivateKey={() => setActiveModal('ClaimWithKey')}
        onMessageUseSigned={() => setActiveModal('ClaimWithMessage')}
        onCancel={onCancel}
      />
      <VerifyAddress
        visible={activeModal === 'VerifyAddress'}
        externalAddress={externalAddress}
        transparentAddress={transparentAddress}
        onNext={() => setActiveModal('GeneratedMessage')}
        onCancel={() => setActiveModal('SelectMethod')}
      />
      <GeneratedMessage
        visible={activeModal === 'GeneratedMessage'}
        externalAddress={externalAddress}
        transparentAddress={transparentAddress}
        onNext={() => setActiveModal('SelectMethod')}
        onCancel={() => setActiveModal('SelectMethod')}
      />
      <ClaimWithKey
        visible={activeModal === 'ClaimWithKey'}
        transparentAddress={transparentAddress}
        externalAmount={balanceWithProof.balance}
        minimumDustAmount={minimumDustAmount}
        onNext={finish}
        onCancel={onCancel}
      />
      <ClaimWithMessage
        visible={activeModal === 'ClaimWithMessage'}
        transparentAddress={transparentAddress}
        externalAmount={balanceWithProof.balance}
        minimumDustAmount={minimumDustAmount}
        onNext={finish}
        onCancel={onCancel}
      />
    </>
  )
}
