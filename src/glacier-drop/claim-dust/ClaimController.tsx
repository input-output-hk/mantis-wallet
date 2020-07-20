import React, {useState, useEffect, PropsWithChildren} from 'react'
import BigNumber from 'bignumber.js'
import {Option, none, some, getOrElse} from 'fp-ts/lib/Option'
import {LoadedState} from '../../common/wallet-state'
import {IncompleteClaim, BalanceWithProof, AuthorizationSignature} from '../glacier-state'
import {EnterAddress} from './EnterAddress'
import {Exchange} from './Exchange'
import {SelectMethod} from './SelectMethod'
import {VerifyAddress} from './VerifyAddress'
import {GeneratedMessage} from './GeneratedMessage'
import {ClaimWithKey} from './ClaimWithKey'
import {ClaimWithMessage} from './ClaimWithMessage'
import {prop} from '../../shared/utils'

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
  minimumThreshold: BigNumber
  activeModal: ModalId
  setActiveModal(modalId: ModalId): void
  onFinish(claim: IncompleteClaim): void
}

export const ClaimController = ({
  walletState,
  minimumThreshold,
  activeModal,
  setActiveModal,
  onFinish,
}: PropsWithChildren<ClaimControllerProps>): JSX.Element => {
  const {transparentAccounts, getOverviewProps} = walletState
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

  const minimumDustAmount = balanceWithProof.balance.dividedBy(1e10)
  // FIXME: PM-1968
  // .dividedBy(TOTAL_ETHER_IN_SNAPSHOT)
  // .multipliedBy(totalDustDistributed)

  useEffect(() => {
    if (activeModal === 'none') {
      setExternalAddress('')
      setTransparentAddress('')
      setBalanceWithProof(none)
    }
  }, [activeModal])

  const createClaim = (authSignature: AuthorizationSignature): IncompleteClaim => {
    return {
      added: new Date(),
      puzzleStatus: 'solving',
      dustAmount: minimumDustAmount, // Final amount will be calculated after unlocking period is over
      transparentAddress,
      externalAddress,
      authSignature,
      externalAmount: balanceWithProof.balance,
      inclusionProof: balanceWithProof.proof,
      withdrawnDustAmount: new BigNumber(0),
      powNonce: null,
      unlockTxHash: null,
      withdrawTxHashes: [],
      txStatuses: {},
      isFinalDustAmount: false,
      numberOfEpochsForFullUnfreeze: null,
      txBuildInProgress: false,
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
        minimumThreshold={minimumThreshold}
        minimumDustAmount={minimumDustAmount}
        availableDust={availableBalance}
        transparentAddresses={transparentAccounts.map(prop('address'))}
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
