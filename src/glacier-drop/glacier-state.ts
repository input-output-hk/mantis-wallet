import {createContainer} from 'unstated-next'
import {useState, useEffect} from 'react'
import {Option, none, some} from 'fp-ts/lib/Option'
import BigNumber from 'bignumber.js'
import {Remote} from 'comlink'
import Web3 from 'web3'
import _ from 'lodash/fp'
import * as t from 'io-ts'
import * as tPromise from 'io-ts-promise'
import {GLACIER_DROP_ADDRESS, CONSTANTS_REPO_ADDRESS} from './glacier-config'
import {Store, createInMemoryStore} from '../common/store'
import {usePersistedState} from '../common/hook-utils'
import {BigNumberFromHexString, SignatureParamCodec} from '../common/io-helpers'
import {validateEthAddress, toHex} from '../common/util'
import {Web3API, makeWeb3Worker, MineResponse, GetMiningStateResponse} from '../web3'
import glacierDropContractABI from '../assets/contracts/GlacierDrop.json'
import constantsRepositoryContractABI from '../assets/contracts/ConstantsRepository.json'

// Contracts

const web3sync = new Web3()
const GlacierDropContract = web3sync.eth.contract(glacierDropContractABI).at(GLACIER_DROP_ADDRESS)
const ConstantsRepositoryContract = web3sync.eth
  .contract(constantsRepositoryContractABI)
  .at(CONSTANTS_REPO_ADDRESS)

// Claim types

export interface BaseClaim {
  added: Date
  transparentAddress: string
  externalAddress: string
  dustAmount: BigNumber
  externalAmount: BigNumber
  withdrawnDustAmount: BigNumber
  authSignature: AuthorizationSignature
  inclusionProof: string
  puzzleDuration: number
  powNonce: number | null
  unlockTxHash: string | null
  withdrawTxHashes: string[]
  txStatuses: Record<string, TransactionStatus>
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

interface GlacierData {
  // Constants
  constants: Option<GlacierConstants>

  // Claims
  claims: Claim[]
  claimedAddresses: string[]
  addClaim(claim: Claim): void
  removeClaims(): Promise<void>

  // Bookkeeping
  updateTxStatuses(currentBlock: number): Promise<void>

  // WalletBackend Calls
  getEtcSnapshotBalanceWithProof(etcAddress: string): Promise<BalanceWithProof>
  authorizationSign(
    transparentAddress: string,
    etcPrivateKey: string,
  ): Promise<AuthorizationSignature>

  // PoW Puzzle
  mine(claim: Claim): Promise<MineResponse>
  getMiningState(claim: Claim): Promise<GetMiningStateResponse>

  // GlacierDrop Contract Calls
  unlock(claim: Claim, callParams: ContractParams, currentBlock: number): Promise<string>
  withdraw(
    claim: Claim,
    callParams: ContractParams,
    currentBlock: number,
    unfrozenDustAmount: BigNumber,
  ): Promise<string>
}

interface GlacierConstants {
  periodConfig: PeriodConfig
  totalDustDistributed: BigNumber
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

interface ContractParams {
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

  const [claims, setClaims] = usePersistedState(store, ['glacierDrop', 'claims'])
  const [constants, setConstants] = useState<Option<GlacierConstants>>(none)

  // Constants

  const loadConstant = async <T>(
    contractFunction: string,
    parse: (raw: string) => T,
  ): Promise<T> => {
    const data = ConstantsRepositoryContract[contractFunction].getData()
    const response = await web3.eth.call(
      {
        to: CONSTANTS_REPO_ADDRESS,
        data,
      },
      'latest',
    )
    return parse(response)
  }

  const loadConstants = async (): Promise<GlacierConstants> => {
    const toNumber = (raw: string): number => parseInt(raw, 16)
    const toBigNumber = (raw: string): BigNumber => new BigNumber(raw)

    return {
      periodConfig: {
        unlockingStartBlock: await loadConstant('getUnlockingStartBlock', toNumber),
        unlockingEndBlock: await loadConstant('getUnlockingEndBlock', toNumber),
        unfreezingStartBlock: await loadConstant('getUnfreezingStartBlock', toNumber),
        epochLength: await loadConstant('getEpochLength', toNumber),
        numberOfEpochs: await loadConstant('getNumberOfEpochs', toNumber),
      },
      totalDustDistributed: await loadConstant('getTotalDustDistributed', toBigNumber),
    }
  }

  useEffect((): void => {
    loadConstants().then((c) => setConstants(some(c)))
  }, [])

  // Claims

  const addClaim = (claim: Claim): void => {
    console.info({addedClaim: claim})
    if (claims[claim.externalAddress] !== undefined) throw Error('Already claimed')
    setClaims({...claims, [claim.externalAddress]: claim})
  }

  const updateClaim = (claim: Claim, updateContent: Partial<Claim>): void => {
    const updatedClaim = _.merge(claim)(updateContent)
    setClaims({...claims, [claim.externalAddress]: updatedClaim})
  }

  const removeClaims = async (): Promise<void> => setClaims({})

  // Utils

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

  // Bookkeeping

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

    newStatuses.map(([claim, txHash, txStatus]) =>
      updateClaim(claim, {txStatuses: {...claim.txStatuses, [txHash]: txStatus}}),
    )
  }

  // WalletBackend Methods

  const getEtcSnapshotBalanceWithProof = async (etcAddress: string): Promise<BalanceWithProof> => {
    const validationError = validateEthAddress(etcAddress)
    if (validationError) throw Error(validationError)

    const result = await gd.getEtcSnapshotBalanceWithProof(etcAddress)
    if (typeof result === 'string') throw Error(result)
    const {balance, proof} = await tPromise.decode(BalanceWithProof, result)
    return {
      balance,
      proof: `0x${proof}`,
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

  const mine = async (claim: Claim): Promise<MineResponse> => {
    const {externalAmount, externalAddress} = claim
    const response = await gd.mine(toHex(externalAmount), externalAddress)
    if (response.status !== 'NewMineStarted') throw Error(response.message)
    updateClaim(claim, {puzzleDuration: response.estimatedTime})
    return response
  }

  const getMiningState = async (claim: Claim): Promise<GetMiningStateResponse> => {
    const response = await gd.getMiningState()
    if (response.status === 'MiningSuccessful') {
      updateClaim(claim, {
        puzzleStatus: 'unsubmitted',
        puzzleDuration: 0,
        powNonce: parseInt(response.nonce, 16),
      })
    }
    return response
  }

  // Contract Call Methods

  const unlock = async (
    claim: Claim,
    {gasLimit, gasPrice}: ContractParams,
    currentBlock: number,
  ): Promise<string> => {
    const {
      authSignature: {v, r, s},
      inclusionProof,
      powNonce,
      puzzleStatus,
      transparentAddress,
      externalAddress,
    } = claim

    if (!powNonce || puzzleStatus !== 'unsubmitted') {
      throw Error('Puzzle is not solved yet.')
    }

    // See GlacierDrop.sol unlock function
    const data = GlacierDropContract.unlock.getData(
      transparentAddress,
      externalAddress.toLowerCase(),
      v,
      r,
      s,
      inclusionProof,
      powNonce,
    )

    console.info({unlockData: data})

    const unlockTxHash = await wallet.callContract({
      from: ['Wallet', transparentAddress],
      to: GLACIER_DROP_ADDRESS,
      value: '0',
      gasLimit: gasLimit.toString(),
      gasPrice: gasPrice.toString(),
      data,
    })

    updateClaim(claim, {
      puzzleStatus: 'submitted',
      unlockTxHash,
      txStatuses: {
        ...claim.txStatuses,
        [unlockTxHash]: {status: 'TransactionPending', atBlock: currentBlock},
      },
    })

    console.info({claims})

    return unlockTxHash
  }

  const withdraw = async (
    claim: Claim,
    {gasLimit, gasPrice}: ContractParams,
    currentBlock: number,
    unfrozenDustAmount: BigNumber,
  ): Promise<string> => {
    const {puzzleStatus, transparentAddress} = claim

    if (puzzleStatus !== 'submitted') {
      throw Error('Puzzle is in invalid status')
    }

    const data = GlacierDropContract.withdraw.getData(claim.externalAddress.toLowerCase())

    const withdrawTxHash = await wallet.callContract({
      from: ['Wallet', transparentAddress],
      to: GLACIER_DROP_ADDRESS,
      value: '0',
      gasLimit: gasLimit.toString(),
      gasPrice: gasPrice.toString(),
      data,
    })

    updateClaim(claim, {
      withdrawTxHashes: [...claim.withdrawTxHashes, withdrawTxHash],
      withdrawnDustAmount: unfrozenDustAmount,
      txStatuses: {
        ...claim.txStatuses,
        [withdrawTxHash]: {status: 'TransactionPending', atBlock: currentBlock},
      },
    })

    console.info({claims})

    return withdrawTxHash
  }

  return {
    constants,
    claims: Object.values(claims), // TODO: sort by added
    claimedAddresses: Object.keys(claims),
    addClaim,
    removeClaims,
    getEtcSnapshotBalanceWithProof,
    authorizationSign,
    mine,
    getMiningState,
    unlock,
    withdraw,
    updateTxStatuses,
  }
}

export const GlacierState = createContainer(useGlacierState)

// util

export const getUnlockStatus = (claim: Claim): TransactionStatus | null => {
  if (!claim.unlockTxHash) return null
  return claim.txStatuses[claim.unlockTxHash]
}

export const getWithdrawalStatus = (claim: Claim): TransactionStatus | null => {
  const {withdrawTxHashes, txStatuses} = claim
  if (withdrawTxHashes.length === 0) {
    return null
  }
  const lastWithdrawalTxHash = withdrawTxHashes[withdrawTxHashes.length - 1]
  return txStatuses[lastWithdrawalTxHash]
}
