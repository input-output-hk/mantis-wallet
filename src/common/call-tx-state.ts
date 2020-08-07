import {useState} from 'react'
import _ from 'lodash/fp'
import {createContainer} from 'unstated-next'
import {Remote} from 'comlink'
import {makeWeb3Worker, Web3API, Transaction} from '../web3'
import {returnDataToHumanReadable} from './util'

interface TransactionPending {
  readonly status: 'TransactionPending'
}

interface TransactionFailed {
  readonly status: 'TransactionFailed'
  readonly message: string
}

interface TransactionOk {
  readonly status: 'TransactionOk'
  readonly message: string
}

export type TransactionStatus = TransactionPending | TransactionFailed | TransactionOk

export interface CallTxState {
  txStatuses: Record<string, TransactionStatus>
  updateTxStatuses(transactions: Transaction[]): Promise<void>
}

interface CallTxStateParams {
  web3: Remote<Web3API>
}

const DEFAULT_STATE: CallTxStateParams = {
  web3: makeWeb3Worker(),
}

function useCallTxState(initialState?: Partial<CallTxStateParams>): CallTxState {
  const _initialState = _.merge(DEFAULT_STATE)(initialState)
  const {eth} = _initialState.web3

  const [txStatuses, setTxStatuses] = useState<Record<string, TransactionStatus>>({}) // TODO: store

  const _getTransactionStatus = async (transactionHash: string): Promise<TransactionStatus> => {
    // private method

    const rawTx = await eth.getTransaction(transactionHash)
    if (rawTx === null) {
      // null if not found or failed
      return {
        status: 'TransactionFailed',
        message: 'Transaction failed before reaching the contract. Try again with a higher fee.',
      }
    }

    const receipt = await eth.getTransactionReceipt(transactionHash)
    return receipt === null
      ? {status: 'TransactionPending'}
      : {
          status: parseInt(receipt.statusCode, 16) === 1 ? 'TransactionOk' : 'TransactionFailed',
          message: receipt.returnData ? returnDataToHumanReadable(receipt.returnData) : '',
        }
  }

  const updateTxStatuses = async (transactions: Transaction[]): Promise<void> => {
    // Update all call transaction statuses

    const hashesToCheck = transactions
      .filter((tx) => tx.txDetails.txType === 'call')
      .map((tx) => tx.hash)

    const newStatuses = await Promise.all(
      hashesToCheck.map(async (txHash) => {
        const newStatus = await _getTransactionStatus(txHash)
        return [txHash, newStatus]
      }),
    )

    setTxStatuses(_.fromPairs(newStatuses))
  }

  return {
    txStatuses,
    updateTxStatuses,
  }
}

export const CallTxState = createContainer(useCallTxState)
