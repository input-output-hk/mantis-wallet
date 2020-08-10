import React, {useState, useEffect, PropsWithChildren} from 'react'
import {message} from 'antd'
import {EmptyProps} from 'antd/lib/empty'
import {isNone, getOrElse, isSome} from 'fp-ts/lib/Option'
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
import {LoadedState, CallTxStatuses} from '../common/wallet-state'
import {rendererLog} from '../common/logger'
import {withStatusGuard, PropsWithWalletState} from '../common/wallet-status-guard'
import {useInterval} from '../common/hook-utils'
import {makeDesktopNotification} from '../common/notify'
import {Token} from '../common/Token'
import {Loading} from '../common/Loading'
import {HeaderWithSyncStatus} from '../common/HeaderWithSyncStatus'
import {LINKS} from '../external-link-config'
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
  callTxStatuses: CallTxStatuses
  showEpochs(): void
  onRemoveClaim(claim: Claim): void
  estimateCallFee: LoadedState['estimateCallFee']
  calculateGasPrice: LoadedState['calculateGasPrice']
}

const ClaimHistory = ({
  claims,
  currentBlock,
  periodConfig,
  callTxStatuses,
  showEpochs,
  onRemoveClaim,
  estimateCallFee,
  calculateGasPrice,
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
                key={c.externalAddress}
                claim={c}
                index={i}
                currentBlock={currentBlock}
                periodConfig={periodConfig}
                callTxStatuses={callTxStatuses}
                showEpochs={showEpochs}
                onSubmitPuzzle={setClaimToSubmit}
                onWithdrawDust={setClaimToWithdraw}
                onRemoveClaim={onRemoveClaim}
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
          onCancel={() => setClaimToSubmit(null)}
          onNext={() => setClaimToSubmit(null)}
          estimateCallFee={estimateCallFee}
          calculateGasPrice={calculateGasPrice}
        />
      )}
      {claimToWithdraw && (
        <WithdrawAvailableDust
          visible
          claim={claimToWithdraw}
          currentBlock={currentBlock}
          periodConfig={periodConfig}
          callTxStatuses={callTxStatuses}
          showEpochs={() => showEpochs()}
          onCancel={() => setClaimToWithdraw(null)}
          onNext={() => setClaimToWithdraw(null)}
          estimateCallFee={estimateCallFee}
          calculateGasPrice={calculateGasPrice}
        />
      )}
    </>
  )
}

const GlacierDropWrapper = ({children}: PropsWithChildren<EmptyProps>): JSX.Element => {
  return (
    <div className="GlacierDropOverview">
      <HeaderWithSyncStatus
        externalLink={{text: 'Learn more about Glacier Drop', url: LINKS.aboutGlacier}}
      >
        Glacier Drop
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
    removeClaim,
    mine,
    cancelMining,
    getMiningState,
    constants,
    constantsError,
    refreshConstants,
    updateUnfreezingClaimData,
    updateDustAmounts,
  } = GlacierState.useContainer()

  const [activeModal, setActiveModal] = useState<ModalId>('none')
  const [epochsShown, showEpochs] = useState<boolean>(false)
  const [claimDisabled, setClaimDisabled] = useState<boolean>(false)

  const {estimateCallFee, calculateGasPrice, callTxStatuses} = walletState
  const {currentBlock, mode} = walletState.syncStatus

  const powPuzzleComplete = claims.some((c) => c.puzzleStatus === 'unsubmitted')
  const solvingClaim: SolvingClaim | undefined = claims.find(
    (c): c is SolvingClaim => c.puzzleStatus === 'solving',
  )

  const {periodConfig, totalAtomToBeDistributed, minimumThreshold} = getOrElse(
    (): GlacierConstants => DEFAULT_GLACIER_CONSTANTS,
  )(constants)
  const period = getCurrentPeriod(currentBlock, periodConfig)

  const handleError = (e: Error): void => {
    rendererLog.error(e)
    message.error(e.message, 5)
  }

  // Checks puzzle mining state every N milliseconds if a mining is in progress

  useInterval(async () => {
    if (!solvingClaim) return

    try {
      const miningState = await getMiningState(solvingClaim)
      if (period !== 'Unlocking') {
        // cancel mining if we're not in the unlocking period
        await cancelMining(solvingClaim)
      } else if (miningState.status === 'MiningNotStarted') {
        // app got restarted: restart mining as well
        await mine(solvingClaim)
      } else if (miningState.status === 'MiningSuccessful') {
        // mining successful: show notification
        makeDesktopNotification('PoW Puzzle Complete')
      }
    } catch (e) {
      handleError(e)
    }
  }, MINING_STATUS_CHECK_INTERVAL)

  // Bookkeeping of values which depend on block progression

  const update = async (): Promise<void> => {
    if (isNone(constants)) return
    await updateUnfreezingClaimData(period, callTxStatuses)
    await updateDustAmounts(period, callTxStatuses)
  }

  useEffect(() => {
    update().catch(handleError)

    if (isSome(constantsError)) {
      refreshConstants()
    }
  }, [currentBlock])

  // Show message on problem with constant loading

  if (isSome(constantsError)) {
    return (
      <GlacierDropWrapper>
        <div className="error">{constantsError.value}</div>
      </GlacierDropWrapper>
    )
  }

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
    addClaim(claim)
      .then((addedClaim: SolvingClaim) => rendererLog.info({addedClaim}))
      .catch(handleError)
  }

  const chooseChain = (_chain: DisplayChain): void => {
    if (claimDisabled) return

    if (walletState.transparentAccounts.length === 0) {
      // Generate first transparent address
      setClaimDisabled(true)
      walletState
        .generateNewAddress()
        .then(() => {
          message.info('We generated your first transparent address.', 5)
          setActiveModal('EnterAddress')
          setClaimDisabled(false)
        })
        .catch((e) => {
          handleError(e)
          setClaimDisabled(false)
        })
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
        callTxStatuses={callTxStatuses}
        showEpochs={() => showEpochs(true)}
        onRemoveClaim={removeClaim}
        estimateCallFee={estimateCallFee}
        calculateGasPrice={calculateGasPrice}
      />
      <ClaimController
        walletState={walletState}
        totalAtomToBeDistributed={totalAtomToBeDistributed}
        minimumThreshold={minimumThreshold}
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
              isUnlocked(claim, callTxStatuses),
            ).isGreaterThan(0),
          )
          .map((claim) => {
            const {transparentAddress, dustAmount} = claim
            const numberOfEpochs = getNumberOfEpochsForClaim(claim, periodConfig)
            return {
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
    <NoWallet />
  </GlacierDropWrapper>
))
