import React, {useState, useEffect} from 'react'
import _ from 'lodash/fp'
import BigNumber from 'bignumber.js'
import {Option, none, some, getOrElse} from 'fp-ts/lib/Option'
import {EnterAddress} from './EnterAddress'
import {Exchange} from './Exchange'
import {LoadedState} from '../../common/wallet-state'
import {SelectMethod} from './SelectMethod'
import {VerifyAddress} from './VerifyAddress'
import {GeneratedMessage} from './GeneratedMessage'
import {ClaimWithKey} from './ClaimWithKey'
import {ClaimWithMessage} from './ClaimWithMessage'
import {Claim, BalanceWithProof, AuthorizationSignature} from '../glacier-state'

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
  activeModal: ModalId
  setActiveModal(modalId: ModalId): void
  onFinish(claim: Claim): void
}

export const ClaimController = ({
  walletState,
  activeModal,
  setActiveModal,
  onFinish,
}: React.PropsWithChildren<ClaimControllerProps>): JSX.Element => {
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

  // FIXME: PM-1708 when sum of total ETC in snapshot is available
  const dustAmount = balanceWithProof.balance.dividedBy(3000000000)

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
      dustAmount,
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
        dustAmount={dustAmount}
        availableDust={availableBalance}
        transparentAddresses={transparentAccounts.map((a) => _.get('address')(a))}
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
        dustAmount={dustAmount}
        onNext={finish}
        onCancel={onCancel}
      />
      <ClaimWithMessage
        visible={activeModal === 'ClaimWithMessage'}
        transparentAddress={transparentAddress}
        externalAmount={balanceWithProof.balance}
        dustAmount={dustAmount}
        onNext={finish}
        onCancel={onCancel}
      />
    </>
  )
}
