import React, {useState, useEffect} from 'react'
import {message} from 'antd'
import {EmptyProps} from 'antd/lib/empty'
import {isNone} from 'fp-ts/lib/Option'
import {DisplayChain} from '../pob/chains'
import {ETC_CHAIN} from './glacier-config'
import {Claim, GlacierState, PeriodConfig, getUnlockStatus} from './glacier-state'
import {withStatusGuard, PropsWithWalletState} from '../common/wallet-status-guard'
import {LoadedState} from '../common/wallet-state'
import {useInterval} from '../common/hook-utils'
import {Token} from '../common/Token'
import {Loading} from '../common/Loading'
import {NoWallet} from '../wallets/NoWallet'
import {PeriodStatus} from './PeriodStatus'
import {getCurrentPeriod, getUnfrozenAmount} from './Period'
import {ClaimController, ModalId} from './claim-dust/ClaimController'
import {ClaimRow} from './ClaimRow'
import {Epochs} from './Epochs'
import {SubmitProofOfUnlock} from './SubmitProofOfUnlock'
import {WithdrawAvailableDust} from './WithdrawAvailableDust'
import {HeaderWithSyncStatus} from '../common/HeaderWithSyncStatus'
import './GlacierDropOverview.scss'

const availableChains: DisplayChain[] = [ETC_CHAIN]

interface ClaimHistoryProps {
  claims: Claim[]
  currentBlock: number
  periodConfig: PeriodConfig
  showEpochs(): void
}

const ClaimHistory = ({
  claims,
  currentBlock,
  periodConfig,
  showEpochs,
}: ClaimHistoryProps): JSX.Element => {
  const [claimToSubmit, setClaimToSubmit] = useState<Claim | null>(null)
  const [claimToWithdraw, setClaimToWithdraw] = useState<Claim | null>(null)

  return (
    <>
      <div className="claim-history">
        <div className="title">
          <div className="main-title">Claim History</div>
          <div className="line"></div>
        </div>
        {claims.length > 0 && (
          <div className="claims">
            {claims.map((c: Claim, i: number) => (
              <ClaimRow
                claim={c}
                index={i}
                key={c.externalAddress}
                currentBlock={currentBlock}
                periodConfig={periodConfig}
                showEpochs={showEpochs}
                onSubmitPuzzle={(claim: Claim): void => setClaimToSubmit(claim)}
                onWithdrawDust={(claim: Claim): void => setClaimToWithdraw(claim)}
              />
            ))}
          </div>
        )}
        {claims.length === 0 && <div className="message">You haven&apos;t made claims yet</div>}
      </div>
      {claimToSubmit && (
        <SubmitProofOfUnlock
          visible
          claim={claimToSubmit}
          currentBlock={currentBlock}
          onCancel={() => setClaimToSubmit(null)}
          onNext={(_unlockTxId) => setClaimToSubmit(null)}
        />
      )}
      {claimToWithdraw && (
        <WithdrawAvailableDust
          visible
          claim={claimToWithdraw}
          currentBlock={currentBlock}
          periodConfig={periodConfig}
          showEpochs={() => showEpochs()}
          onCancel={() => setClaimToWithdraw(null)}
          onNext={() => setClaimToWithdraw(null)}
        />
      )}
    </>
  )
}

const _GlacierDropOverview = ({
  walletState,
}: PropsWithWalletState<EmptyProps, LoadedState>): JSX.Element => {
  const {
    claims,
    addClaim,
    mine,
    getMiningState,
    updateTxStatuses,
    constants,
  } = GlacierState.useContainer()

  if (isNone(constants)) {
    return <Loading />
  }
  const {periodConfig} = constants.value
  const {currentBlock} = walletState.syncStatus
  const period = getCurrentPeriod(currentBlock, periodConfig)

  const powPuzzleComplete = claims.some((c) => c.puzzleStatus === 'unsubmitted')
  const solvingClaim = claims.find((c) => c.puzzleStatus === 'solving')

  const [activeModal, setActiveModal] = useState<ModalId>('none')
  const [epochsShown, showEpochs] = useState<boolean>(false)

  useInterval(async () => {
    if (!solvingClaim) return
    try {
      await getMiningState(solvingClaim)
    } catch (e) {
      console.error(e)
    }
  }, 2000)

  useEffect(() => {
    updateTxStatuses(currentBlock).catch((e) => console.error(e))
  }, [currentBlock])

  const chooseChain = (_chain: DisplayChain): void => {
    if (walletState.transparentAccounts.length === 0) {
      message.error('You must create a transparent address first.')
    } else {
      setActiveModal('EnterAddress')
    }
  }

  const startPuzzle = (claim: Claim): void => {
    addClaim(claim)
    mine(claim)
  }

  return (
    <div className="GlacierDropOverview">
      <HeaderWithSyncStatus>
        Glacier Drop
        <div className="link">Learn more about Glacier Drop</div>
      </HeaderWithSyncStatus>
      <div className="content">
        <div className="wallet-selector"></div>
        {period === 'Unlocking' && !solvingClaim && (
          <div className="claim-buttons">
            {availableChains.map((c: DisplayChain) => (
              <Token chain={c} chooseChain={chooseChain} key={c.name}>
                Claim Dust
              </Token>
            ))}
          </div>
        )}
        <PeriodStatus
          currentBlock={currentBlock}
          periodConfig={periodConfig}
          powPuzzleComplete={powPuzzleComplete}
        />
        <ClaimHistory
          claims={claims}
          currentBlock={currentBlock}
          periodConfig={periodConfig}
          showEpochs={() => showEpochs(true)}
        />
      </div>
      <ClaimController
        walletState={walletState}
        onFinish={startPuzzle}
        activeModal={activeModal}
        setActiveModal={setActiveModal}
      />
      <Epochs
        visible={epochsShown}
        epochRows={claims
          .filter((claim) =>
            getUnfrozenAmount(
              currentBlock,
              periodConfig,
              getUnlockStatus(claim),
              claim.dustAmount,
            ).isGreaterThan(0),
          )
          .map(({transparentAddress, dustAmount}) => ({
            walletId: 1, // FIXME: [PM-1555] Refactor WalletState for Multiple Wallets
            transparentAddress,
            dustAmount,
          }))}
        periodConfig={periodConfig}
        currentBlock={currentBlock}
        onCancel={() => showEpochs(false)}
      />
    </div>
  )
}

export const GlacierDropOverview = withStatusGuard(_GlacierDropOverview, 'LOADED', () => (
  <div className="no-wallet-container">
    <NoWallet />
  </div>
))
