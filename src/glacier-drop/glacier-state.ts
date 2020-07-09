import {createContainer} from 'unstated-next'
import {useState, useEffect} from 'react'
import {Option, none, some, isNone, isSome} from 'fp-ts/lib/Option'
import BigNumber from 'bignumber.js'
import {Remote} from 'comlink'
import Web3 from 'web3'
import _ from 'lodash/fp'
import * as t from 'io-ts'
import * as tPromise from 'io-ts-promise'
import {Store, createInMemoryStore} from '../common/store'
import {usePersistedState} from '../common/hook-utils'
import {BigNumberFromHexString, SignatureParamCodec} from '../common/io-helpers'
import {validateEthAddress, toHex} from '../common/util'
import {BuildJobState} from '../common/build-job-state'
import {loadCurrentContractAddresses} from './glacier-config'
import {
  Web3API,
  makeWeb3Worker,
  NewMineStarted,
  GetMiningStateResponse,
  CallParams,
  CancelMiningResponse,
} from '../web3'
import {Period} from './Period'
import glacierDropContractABI from '../assets/contracts/GlacierDrop.json'
import constantsRepositoryContractABI from '../assets/contracts/ConstantsRepository.json'
import {rendererLog} from '../common/logger'
import {ContractConfigItem} from '../config/type'

const GLACIER_CONSTANTS_NOT_LOADED_MSG = 'Glacier Drop constants not loaded'

// Contracts
const web3sync = new Web3()
const GlacierDropContract = web3sync.eth.contract(glacierDropContractABI).at()
const ConstantsRepositoryContract = web3sync.eth.contract(constantsRepositoryContractABI).at()

// Claim types

export interface BaseClaim {
  // basic
  externalAddress: string // unique ID of claims
  transparentAddress: string
  externalAmount: BigNumber
  added: Date
  // reward (initially: minimum, then: correct amount)
  dustAmount: BigNumber
  isFinalDustAmount: boolean
  // transactions
  unlockTxHash: string | null
  withdrawTxHashes: string[]
  txStatuses: Record<string, TransactionStatus>
  // unlocking
  authSignature: AuthorizationSignature
  inclusionProof: string
  puzzleDuration: number
  powNonce: number | null
  // unfreezing
  numberOfEpochsForFullUnfreeze: number | null
  withdrawnDustAmount: BigNumber
  // etc
  txBuildInProgress: boolean
}

export interface SolvingClaim extends BaseClaim {
  puzzleStatus: 'solving'
  unlockTxHash: null
  powNonce: null
}

export interface UnsubmittedClaim extends BaseClaim {
  puzzleStatus: 'unsubmitted'
  unlockTxHash: null
  powNonce: number
}

export interface SubmittedClaim extends BaseClaim {
  puzzleStatus: 'submitted'
  unlockTxHash: string
  powNonce: number
}

export type Claim = SolvingClaim | UnsubmittedClaim | SubmittedClaim
export type IncompleteClaim = Omit<SolvingClaim, 'puzzleDuration'>

// API types

const BalanceWithProof = t.type({
  balance: BigNumberFromHexString,
  proof: t.string,
})

export type BalanceWithProof = t.TypeOf<typeof BalanceWithProof>

const AuthorizationSignature = t.type({
  r: SignatureParamCodec,
  s: SignatureParamCodec,
  v: t.number,
})

export type AuthorizationSignature = t.TypeOf<typeof AuthorizationSignature>

// TransactionReceipt related types

interface TransactionPending {
  status: 'TransactionPending'
  atBlock: number
}

interface TransactionFailed {
  status: 'TransactionFailed'
  atBlock: number
  returnData: string
}

interface TransactionOk {
  status: 'TransactionOk'
  atBlock: number
  returnData: string
}

export type TransactionStatus = TransactionPending | TransactionFailed | TransactionOk

// Glacier Store

export interface GlacierData {
  // Constants
  constants: Option<GlacierConstants>
  constantsError: Option<string>
  refreshConstants(): Promise<void>

  // Contract info
  contractAddresses: ContractConfigItem

  // Claims
  claims: Claim[]
  claimedAddresses: string[]
  addClaim(claim: IncompleteClaim): Promise<SolvingClaim>
  removeClaims(): Promise<void>

  // Bookkeeping
  updateTxStatuses(currentBlock: number): Promise<void>
  updateDustAmounts(period: Period): Promise<void>
  updateUnfreezingClaimData(period: Period): Promise<void>

  // WalletBackend Calls
  getEtcSnapshotBalanceWithProof(etcAddress: string): Promise<BalanceWithProof>
  authorizationSign(
    transparentAddress: string,
    etcPrivateKey: string,
  ): Promise<AuthorizationSignature>

  // PoW Puzzle
  getMiningState(claim: Claim): Promise<GetMiningStateResponse>
  cancelMining(claim: Claim): Promise<CancelMiningResponse>

  // GlacierDrop Contract Calls
  getUnlockCallParams(claim: Claim, gasParams: GasParams): CallParams
  getWithdrawCallParams(claim: Claim, gasParams: GasParams): CallParams
  unlock(claim: Claim, gasParams: GasParams, currentBlock: number): Promise<string>
  withdraw(
    claim: Claim,
    gasParams: GasParams,
    currentBlock: number,
    unfrozenDustAmount: BigNumber,
  ): Promise<string>
}

export interface GlacierConstants {
  periodConfig: PeriodConfig
  totalDustDistributed: BigNumber
  minimumThreshold: BigNumber
}

export interface PeriodConfig {
  unlockingStartBlock: number
  unlockingEndBlock: number
  unfreezingStartBlock: number
  epochLength: number
  numberOfEpochs: number
}

// Persistent State

export type StoreGlacierData = {
  glacierDrop: {
    claims: Record<string, Claim>
  }
}

export const defaultGlacierData: StoreGlacierData = {
  glacierDrop: {
    claims: {},
  },
}

// Params

interface GasParams {
  gasLimit: BigNumber
  gasPrice: BigNumber
}

interface GlacierStateParams {
  web3: Remote<Web3API>
  store: Store<StoreGlacierData>
}

const DEFAULT_STATE = {
  web3: makeWeb3Worker(),
  store: createInMemoryStore(defaultGlacierData),
}

function useGlacierState(initialState?: Partial<GlacierStateParams>): GlacierData {
  const {web3, store} = _.merge(DEFAULT_STATE)(initialState)
  const {wallet, glacierDrop: gd} = web3.midnight
  const buildJobState = BuildJobState.useContainer()

  const [claims, setClaims] = usePersistedState(store, ['glacierDrop', 'claims'])
  const [constants, setConstants] = useState<Option<GlacierConstants>>(none)
  const [constantsError, setConstantsError] = useState<Option<string>>(none)

  const [totalUnlockedEtherCache, setTotalUnlockedEtherCache] = useState<Option<BigNumber>>(none)

  const contractAddresses = loadCurrentContractAddresses()

  //
  // Constants
  //

  const simulateTransaction = async (contractAddress: string, data: string): Promise<string> => {
    // Used for simulating contract calls, e.g. for getting constant values without spending tx fee
    return web3.eth.call(
      {
        to: contractAddress,
        data,
      },
      'latest',
    )
  }

  const loadConstant = async <T>(
    contractFunction: string,
    parse: (raw: string) => T,
  ): Promise<T> => {
    const data = ConstantsRepositoryContract[contractFunction].getData()
    const response = await simulateTransaction(contractAddresses.constantsRepo, data)
    return parse(response)
  }

  const loadConstants = async (): Promise<GlacierConstants> => {
    const toNumber = (raw: string): number => parseInt(raw, 16)
    const toBigNumber = (raw: string): BigNumber => {
      const result = new BigNumber(raw)
      if (result.isNaN()) {
        throw Error('Failed to load Glacier Drop constants from smart contract')
      }
      return result
    }

    return {
      periodConfig: {
        unlockingStartBlock: await loadConstant('getUnlockingStartBlock', toNumber),
        unlockingEndBlock: await loadConstant('getUnlockingEndBlock', toNumber),
        unfreezingStartBlock: await loadConstant('getUnfreezingStartBlock', toNumber),
        epochLength: await loadConstant('getEpochLength', toNumber),
        numberOfEpochs: await loadConstant('getNumberOfEpochs', toNumber),
      },
      totalDustDistributed: await loadConstant('getTotalDustDistributed', toBigNumber),
      minimumThreshold: await loadConstant('getMinimumThreshold', toBigNumber),
    }
  }

  const refreshConstants = async (): Promise<void> => {
    rendererLog.info('Attempting to load Glacier Drop constants')
    loadConstants()
      .then((c) => {
        setConstants(some(c))
        setConstantsError(none)
      })
      .catch((e) => {
        rendererLog.error(e)
        setConstantsError(some(e.message))
      })
  }

  useEffect((): void => {
    refreshConstants()
  }, [])

  //
  // Statistics
  //

  const getTotalUnlockedEther = async (): Promise<BigNumber> => {
    if (isSome(totalUnlockedEtherCache)) {
      // Return cached value if available
      return totalUnlockedEtherCache.value
    } else {
      // Get value via tx simulation
      const data = GlacierDropContract.getTotalUnlockedEther.getData()
      const response = await simulateTransaction(contractAddresses.glacierDrop, data)
      const totalUnlockedEther = new BigNumber(response)
      setTotalUnlockedEtherCache(some(totalUnlockedEther))
      return totalUnlockedEther
    }
  }

  const getFinalUnlockedDustForClaim = (claim: Claim, totalUnlockedEther: BigNumber): BigNumber => {
    if (isNone(constants)) {
      throw Error(GLACIER_CONSTANTS_NOT_LOADED_MSG)
    }
    const {totalDustDistributed} = constants.value
    const {externalAmount} = claim

    return externalAmount.dividedBy(totalUnlockedEther).multipliedBy(totalDustDistributed)
  }

  //
  // Claim-specific constants
  //

  const getNumberOfEpochsForFullUnfreeze = async (externalAddress: string): Promise<number> => {
    const data = GlacierDropContract.getNumberOfEpochsForFullUnfreeze.getData(
      normalizeAddress(externalAddress),
    )
    const response = await simulateTransaction(contractAddresses.glacierDrop, data)
    return parseInt(response, 16)
  }

  //
  // Claims
  //

  const updateClaim = (updatedClaim: Claim): void => {
    setClaims({...claims, [updatedClaim.externalAddress]: updatedClaim})
  }

  const updateClaims = (updatedClaims: Claim[]): void => {
    const claimsByExternalAddress = _.keyBy((c: Claim) => c.externalAddress)(updatedClaims)
    setClaims({...claims, ...claimsByExternalAddress})
  }

  const removeClaims = async (): Promise<void> => setClaims({})

  //
  // Utils
  //

  const getTransactionStatus = async (
    transactionHash: string,
    currentBlock: number,
  ): Promise<TransactionStatus> => {
    const receipt = await web3.eth.getTransactionReceipt(transactionHash)
    if (!receipt) {
      return {status: 'TransactionPending', atBlock: currentBlock}
    } else {
      return {
        status: parseInt(receipt.statusCode, 16) === 1 ? 'TransactionOk' : 'TransactionFailed',
        returnData: receipt.returnData,
        atBlock: currentBlock,
      }
    }
  }

  //
  // Bookkeeping
  //

  const updateTxStatuses = async (currentBlock: number): Promise<void> => {
    // collect all pending transactions from all claims
    // and fetch new status if we're in a new block
    const newStatuses = await Promise.all(
      Object.values(claims)
        .flatMap((claim: Claim) =>
          _.toPairs(claim.txStatuses)
            .filter(
              ([_txHash, txStatus]) =>
                txStatus.atBlock !== currentBlock && txStatus.status === 'TransactionPending',
            )
            .map(([txHash, _txStatus]): [Claim, string] => [claim, txHash]),
        )
        .map(
          async ([claim, txHash]): Promise<[Claim, string, TransactionStatus]> => {
            const newStatus = await getTransactionStatus(txHash, currentBlock)
            return [claim, txHash, newStatus]
          },
        ),
    )

    const updateArray = newStatuses.map(
      ([claim, txHash, txStatus]): Claim => ({
        ...claim,
        txStatuses: {...claim.txStatuses, [txHash]: txStatus},
      }),
    )
    updateClaims(updateArray)
  }

  const updateDustAmounts = async (period: Period): Promise<void> => {
    // Updates dust amounts to the final ones calculated from total unlocked ether
    if (period === 'UnlockingNotStarted' || period === 'Unlocking') {
      return // Update is only needed when unlocking period is over
    }

    const claimsToUpdate = Object.values(claims).filter(
      (c: Claim) => !c.isFinalDustAmount && isUnlocked(c),
    )
    if (_.isEmpty(claimsToUpdate)) {
      return // No claim to update
    }

    const totalUnlockedEther = await getTotalUnlockedEther()
    const updateArray = claimsToUpdate.map(
      (claim): Claim => ({
        ...claim,
        dustAmount: getFinalUnlockedDustForClaim(claim, totalUnlockedEther),
        isFinalDustAmount: true,
      }),
    )

    updateClaims(updateArray)
  }

  const updateUnfreezingClaimData = async (period: Period): Promise<void> => {
    // Updates epochs needed for full withdrawal of claim rewards

    if (period !== 'Unfreezing') {
      return // Update is only needed in Unfreezing period
    }

    const claimsToUpdate = Object.values(claims).filter(
      (c: Claim) => !c.numberOfEpochsForFullUnfreeze && isUnlocked(c),
    )
    if (_.isEmpty(claimsToUpdate)) {
      return // No claim to update
    }

    const epochsNeededByEtcAddress = _.fromPairs(
      await Promise.all(
        claimsToUpdate.map(async (claim: Claim) => {
          const epochsNeeded = await getNumberOfEpochsForFullUnfreeze(claim.externalAddress)
          return [claim.externalAddress, epochsNeeded]
        }),
      ),
    )

    const updateArray = claimsToUpdate.map(
      (claim): Claim => ({
        ...claim,
        numberOfEpochsForFullUnfreeze: epochsNeededByEtcAddress[claim.externalAddress],
      }),
    )

    updateClaims(updateArray)
  }

  //
  // WalletBackend Methods
  //

  // Authorization

  const getEtcSnapshotBalanceWithProof = async (etcAddress: string): Promise<BalanceWithProof> => {
    const validationError = validateEthAddress(etcAddress)
    if (validationError) throw Error(validationError)

    const result = await gd.getEtcSnapshotBalanceWithProof(etcAddress)
    if (typeof result === 'string') throw Error(result)
    const {balance, proof} = await tPromise.decode(BalanceWithProof, result)
    return {
      balance,
      proof,
    }
  }

  const authorizationSign = async (
    transparentAddress: string,
    etcPrivateKey: string,
  ): Promise<AuthorizationSignature> => {
    const result = await gd.authorizationSign(transparentAddress, {etcPrivateKey})
    if (typeof result === 'string') throw Error(result)
    return tPromise.decode(AuthorizationSignature, result)
  }

  // PoW Puzzle

  const mine = async (claim: IncompleteClaim): Promise<NewMineStarted> => {
    if (isNone(constants)) {
      throw Error(GLACIER_CONSTANTS_NOT_LOADED_MSG)
    }

    const {externalAmount, externalAddress} = claim
    const {unlockingStartBlock, unlockingEndBlock} = constants.value.periodConfig
    const response = await gd.mine(
      toHex(externalAmount),
      externalAddress,
      unlockingStartBlock,
      unlockingEndBlock,
    )
    if (response.status !== 'NewMineStarted') throw Error(response.message)
    return response
  }

  const cancelMining = async (claim: Claim): Promise<CancelMiningResponse> => {
    // Used when unlocking period is over and mining is not finished yet

    if (claim.puzzleStatus !== 'solving') {
      throw Error('Mining is not in progress')
    }

    const response = await gd.cancelMining()
    console.log({response})
    if (response.status !== 'MiningCanceled') {
      throw Error(response.message)
    }

    // Set to "unsubmitted" state, as submitting is disabled when unlocking period is over
    updateClaim({...claim, puzzleStatus: 'unsubmitted', powNonce: 0})

    return response
  }

  const getMiningState = async (claim: SolvingClaim): Promise<GetMiningStateResponse> => {
    const response = await gd.getMiningState()
    if (response.status === 'MiningSuccessful') {
      updateClaim({
        ...claim,
        puzzleStatus: 'unsubmitted',
        puzzleDuration: 0,
        powNonce: parseInt(response.nonce, 16),
      })
    } else if (response.status === 'MiningNotStarted') {
      await mine(claim)
    }
    return response
  }

  // Initialize a new claim and start mining
  const addClaim = async (claim: IncompleteClaim): Promise<SolvingClaim> => {
    if (claims[claim.externalAddress] !== undefined) throw Error('Already claimed')

    // start mining and get estimated time
    const mineResponse = await mine(claim)
    const puzzleDuration = mineResponse.estimatedTime

    const completeClaim: SolvingClaim = {...claim, puzzleDuration}
    setClaims({...claims, [claim.externalAddress]: completeClaim})
    return completeClaim
  }

  //
  // Contract Call Methods
  //

  const getUnlockCallParams = (
    claim: UnsubmittedClaim,
    {gasLimit, gasPrice}: GasParams,
  ): CallParams => {
    const {
      authSignature: {v, r, s},
      inclusionProof,
      powNonce,
      transparentAddress,
      externalAddress,
    } = claim

    // See GlacierDrop.sol unlock function
    const data = GlacierDropContract.unlock.getData(
      transparentAddress,
      normalizeAddress(externalAddress),
      v,
      r,
      s,
      inclusionProof,
      powNonce,
    )

    return {
      from: ['Wallet', transparentAddress],
      to: contractAddresses.glacierDrop,
      value: '0',
      gasLimit: gasLimit.toString(),
      gasPrice: gasPrice.toString(),
      data,
    }
  }

  const unlock = async (
    claim: UnsubmittedClaim,
    {gasLimit, gasPrice}: GasParams,
    currentBlock: number,
  ): Promise<string> => {
    const {powNonce, puzzleStatus} = claim

    if (!powNonce || puzzleStatus !== 'unsubmitted') {
      throw Error('Puzzle is not solved yet.')
    }

    const unlockCallParams = getUnlockCallParams(claim, {gasLimit, gasPrice})
    rendererLog.info({unlockCallParams})

    const {jobHash} = await wallet.callContract(unlockCallParams, false)

    await buildJobState.submitJob(jobHash, (unlockTxHash: string) => {
      updateClaim({
        ...claim,
        txBuildInProgress: false,
        puzzleStatus: 'submitted',
        unlockTxHash,
        txStatuses: {
          ...claim.txStatuses,
          [unlockTxHash]: {status: 'TransactionPending', atBlock: currentBlock},
        },
      })
    })

    updateClaim({...claim, txBuildInProgress: true})

    return jobHash
  }

  const getWithdrawCallParams = (claim: Claim, {gasLimit, gasPrice}: GasParams): CallParams => {
    const {transparentAddress} = claim

    const data = GlacierDropContract.withdraw.getData(normalizeAddress(claim.externalAddress))

    return {
      from: ['Wallet', transparentAddress],
      to: contractAddresses.glacierDrop,
      value: '0',
      gasLimit: gasLimit.toString(),
      gasPrice: gasPrice.toString(),
      data,
    }
  }

  const withdraw = async (
    claim: Claim,
    {gasLimit, gasPrice}: GasParams,
    currentBlock: number,
    unfrozenDustAmount: BigNumber,
  ): Promise<string> => {
    const {puzzleStatus} = claim

    if (puzzleStatus !== 'submitted') {
      throw Error('Puzzle is in invalid status')
    }

    const withdrawCallParams = getWithdrawCallParams(claim, {gasLimit, gasPrice})
    rendererLog.info({withdrawCallParams})

    const {jobHash} = await wallet.callContract(withdrawCallParams, false)

    await buildJobState.submitJob(jobHash, (withdrawTxHash: string) => {
      updateClaim({
        ...claim,
        txBuildInProgress: false,
        withdrawTxHashes: [...claim.withdrawTxHashes, withdrawTxHash],
        withdrawnDustAmount: unfrozenDustAmount,
        txStatuses: {
          ...claim.txStatuses,
          [withdrawTxHash]: {status: 'TransactionPending', atBlock: currentBlock},
        },
      })
    })

    updateClaim({...claim, txBuildInProgress: true})

    return jobHash
  }

  const claimList = _.sortBy((c: Claim) => c.added)(Object.values(claims))
  const claimedAddresses = claimList.map((c) => c.externalAddress)

  return {
    constants,
    constantsError,
    refreshConstants,
    contractAddresses,
    claims: claimList,
    claimedAddresses,
    addClaim,
    removeClaims,
    getEtcSnapshotBalanceWithProof,
    authorizationSign,
    cancelMining,
    getMiningState,
    getUnlockCallParams,
    getWithdrawCallParams,
    unlock,
    withdraw,
    updateTxStatuses,
    updateDustAmounts,
    updateUnfreezingClaimData,
  }
}

export const GlacierState = createContainer(useGlacierState)

// free utility functions

export function isUnlocked(claim: Claim): boolean {
  return getUnlockStatus(claim)?.status === 'TransactionOk'
}

export function getUnlockStatus(claim: Claim): TransactionStatus | null {
  if (!claim.unlockTxHash) return null
  return claim.txStatuses[claim.unlockTxHash]
}

export function getWithdrawalStatus(claim: Claim): TransactionStatus | null {
  const {withdrawTxHashes, txStatuses} = claim
  if (withdrawTxHashes.length === 0) {
    return null
  }
  const lastWithdrawalTxHash = withdrawTxHashes[withdrawTxHashes.length - 1]
  return txStatuses[lastWithdrawalTxHash]
}

export function normalizeAddress(externalAddress: string): string {
  return externalAddress.toLowerCase()
}
