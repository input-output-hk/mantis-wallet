import React, {useState, useEffect} from 'react'
import {message} from 'antd'
import {EmptyProps} from 'antd/lib/empty'
import {isNone, getOrElse} from 'fp-ts/lib/Option'
import {DisplayChain} from '../pob/chains'
import {ETC_CHAIN, MINING_STATUS_CHECK_INTERVAL, DEFAULT_GLACIER_CONSTANTS} from './glacier-config'
import {
  Claim,
  GlacierState,
  PeriodConfig,
  SolvingClaim,
  IncompleteClaim,
  isUnlocked,
  GlacierConstants,
} from './glacier-state'
import {LoadedState} from '../common/wallet-state'
import {withStatusGuard, PropsWithWalletState} from '../common/wallet-status-guard'
import {useInterval} from '../common/hook-utils'
import {makeDesktopNotification} from '../common/notify'
import {Token} from '../common/Token'
import {Loading} from '../common/Loading'
import {HeaderWithSyncStatus} from '../common/HeaderWithSyncStatus'
import {NoWallet} from '../wallets/NoWallet'
import {
  getCurrentPeriod,
  getUnfrozenAmount,
  getNumberOfEpochsForClaim,
  getCurrentEpoch,
} from './Period'
import {PeriodStatus} from './PeriodStatus'
import {ClaimController, ModalId} from './claim-dust/ClaimController'
import {ClaimRow} from './ClaimRow'
import {Epochs} from './Epochs'
import {SubmitProofOfUnlock} from './SubmitProofOfUnlock'
import {WithdrawAvailableDust} from './WithdrawAvailableDust'
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

  const period = getCurrentPeriod(currentBlock, periodConfig)

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
                key={c.externalAddress}
                claim={c}
                index={i}
                currentBlock={currentBlock}
                periodConfig={periodConfig}
                period={period}
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

const GlacierDropWrapper = ({children}: React.PropsWithChildren<EmptyProps>): JSX.Element => {
  return (
    <div className="GlacierDropOverview">
      <HeaderWithSyncStatus>
        Glacier Drop
        <div className="link">Learn more about Glacier Drop</div>
      </HeaderWithSyncStatus>
      <div className="content">{children}</div>
    </div>
  )
}

const _GlacierDropOverview = ({
  walletState,
}: PropsWithWalletState<EmptyProps, LoadedState>): JSX.Element => {
  const {
    claims,
    addClaim,
    getMiningState,
    constants,
    updateTxStatuses,
    updateUnfreezingClaimData,
    updateDustAmounts,
  } = GlacierState.useContainer()

  const [activeModal, setActiveModal] = useState<ModalId>('none')
  const [epochsShown, showEpochs] = useState<boolean>(false)

  const {currentBlock, mode} = walletState.syncStatus

  const powPuzzleComplete = claims.some((c) => c.puzzleStatus === 'unsubmitted')
  const solvingClaim = claims.find((c) => c.puzzleStatus === 'solving')

  // Checks puzzle mining state every N milliseconds if a mining is in progress

  useInterval(async () => {
    if (!solvingClaim) return
    try {
      const miningState = await getMiningState(solvingClaim)
      if (miningState.status === 'MiningSuccessful') {
        makeDesktopNotification('PoW Puzzle Complete')
      }
    } catch (e) {
      console.error(e)
    }
  }, MINING_STATUS_CHECK_INTERVAL)

  // Bookkeeping of values which depend on block progression

  const {periodConfig, totalDustDistributed} = getOrElse(
    (): GlacierConstants => DEFAULT_GLACIER_CONSTANTS,
  )(constants)

  const period = getCurrentPeriod(currentBlock, periodConfig)

  const update = async (): Promise<void> => {
    if (isNone(constants)) return
    await updateTxStatuses(currentBlock)
    await updateUnfreezingClaimData(period)
    await updateDustAmounts(period)
  }

  useEffect(() => {
    update().catch(console.error)
  }, [currentBlock])

  // Wait for constants to be loaded

  if (isNone(constants)) {
    return <Loading />
  }

  // Do not allow Glacier Drop operations when wallet is not syncing

  if (mode === 'offline') {
    return (
      <GlacierDropWrapper>
        <div className="error">Wallet is not syncing.</div>
      </GlacierDropWrapper>
    )
  }

  // Callbacks

  const startPuzzle = (claim: IncompleteClaim): void => {
    addClaim(claim).then((addedClaim: SolvingClaim) => console.info({addedClaim}))
  }

  const chooseChain = (_chain: DisplayChain): void => {
    if (walletState.transparentAccounts.length === 0) {
      message.error('You must create a transparent address first.')
    } else {
      setActiveModal('EnterAddress')
    }
  }

  return (
    <GlacierDropWrapper>
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
      <ClaimController
        walletState={walletState}
        totalDustDistributed={totalDustDistributed}
        onFinish={startPuzzle}
        activeModal={activeModal}
        setActiveModal={setActiveModal}
      />
      <Epochs
        visible={epochsShown}
        epochRows={claims
          .filter((claim) =>
            getUnfrozenAmount(
              claim.dustAmount,
              getCurrentEpoch(currentBlock, periodConfig),
              getNumberOfEpochsForClaim(claim, periodConfig),
              isUnlocked(claim),
            ).isGreaterThan(0),
          )
          .map((claim) => {
            const {transparentAddress, dustAmount} = claim
            const numberOfEpochs = getNumberOfEpochsForClaim(claim, periodConfig)
            return {
              walletId: 1, // FIXME: [PM-1555] Refactor WalletState for Multiple Wallets
              numberOfEpochs,
              transparentAddress,
              dustAmount,
            }
          })}
        periodConfig={periodConfig}
        currentBlock={currentBlock}
        onCancel={() => showEpochs(false)}
      />
    </GlacierDropWrapper>
  )
}

export const GlacierDropOverview = withStatusGuard(_GlacierDropOverview, 'LOADED', () => (
  <GlacierDropWrapper>
    <div className="no-wallet-container">
      <NoWallet />
    </div>
  </GlacierDropWrapper>
))
