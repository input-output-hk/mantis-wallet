import {createContainer} from 'unstated-next'
import _ from 'lodash/fp'
import {Remote} from 'comlink'
import BigNumber from 'bignumber.js'
import {Store, createInMemoryStore} from '../common/store'
import {usePersistedState} from '../common/hook-utils'
import {createTErrorRenderer} from '../common/i18n'
import {makeWeb3Worker, Web3API} from '../web3'
import {getSendTokenParams, ERC20Contract} from './tokens-utils'
import {toHex, bech32toHex, returnDataToHumanReadable} from '../common/util'
import {BuildJobState} from '../common/build-job-state'
import {rendererLog} from '../common/logger'

export interface Token {
  name: string
  symbol: string
  decimals: number
  address: string
}

export interface TokensData {
  tokens: Record<string, Token>
  addToken: (token: Token) => Promise<void>
  removeToken: (tokenAddress: string) => void
  sendToken: (
    token: Token,
    senderAddress: string,
    recipientAddress: string,
    amount: BigNumber,
    fee: BigNumber,
  ) => Promise<void>
  isValidContract: (tokenAddress: string) => Promise<boolean>
  getTokenInfo: (tokenAddress: string) => Promise<Partial<Token>>
  reset: () => void
}

export interface StoreTokensData {
  tokens: {
    watched: Record<string, Token>
  }
}

interface TokensInitialState {
  store: Store<StoreTokensData>
  web3: Remote<Web3API>
}

export const defaultTokensData = {
  tokens: {
    watched: {},
  },
}

function useTokenState(
  {store, web3}: TokensInitialState = {
    store: createInMemoryStore(defaultTokensData),
    web3: makeWeb3Worker(),
  },
): TokensData {
  const buildJobState = BuildJobState.useContainer()

  const {
    eth,
    midnight: {wallet},
  } = web3

  const [tokens, setTokens] = usePersistedState(store, ['tokens', 'watched'])

  const contractCall = async (tokenAddress: string, data: string): Promise<string> =>
    eth.call(
      {
        to: tokenAddress,
        data,
      },
      'latest',
    )

  const isValidContract = async (tokenAddress: string): Promise<boolean> => {
    try {
      const balance = await contractCall(
        tokenAddress,
        ERC20Contract.balanceOf.getData(bech32toHex(tokenAddress)),
      )
      const totalSupply = await contractCall(tokenAddress, ERC20Contract.totalSupply.getData())
      return balance !== '0x' && totalSupply !== '0x'
    } catch (err) {
      rendererLog.error(err)
      return false
    }
  }

  const addToken = async (token: Token): Promise<void> => {
    const validContract = await isValidContract(token.address)
    if (!validContract) {
      throw createTErrorRenderer(['tokens', 'error', 'invalidERC20Contract'])
    }
    const existingToken = tokens[token.address]
    if (existingToken !== undefined) {
      throw createTErrorRenderer(['tokens', 'error', 'tokenAddressAlreadyTracked'], {
        replace: {tokenName: existingToken.name},
      })
    }
    setTokens({
      ...tokens,
      [token.address]: token,
    })
  }

  const removeToken = (tokenAddress: string): void => {
    if (tokens[tokenAddress]) {
      setTokens(_.omit(tokenAddress)(tokens) as Record<string, Token>)
    }
  }

  const reset = (): void => {
    setTokens({})
  }

  const sendToken = async (
    token: Token,
    senderAddress: string,
    recipientAddress: string,
    amount: BigNumber,
    fee: BigNumber,
  ): Promise<void> => {
    const callParams = getSendTokenParams(token, senderAddress, recipientAddress, amount)
    const gasLimit = await wallet.estimateGas(callParams)
    const gasPrice = await wallet.calculateGasPrice('call', fee.toNumber(), callParams)
    const {jobHash} = await wallet.callContract(
      {
        ...callParams,
        gasPrice: gasPrice.toString(10),
        gasLimit: toHex(gasLimit),
      },
      false,
    )
    await buildJobState.submitJob(jobHash)
  }

  const getTokenName = async (tokenAddress: string): Promise<Partial<Token>> => {
    const nameFromContract = await contractCall(tokenAddress, ERC20Contract.name.getData())
    const name = returnDataToHumanReadable(nameFromContract)
    return name ? {name} : {}
  }

  const getTokenSymbol = async (tokenAddress: string): Promise<Partial<Token>> => {
    const symbolFromContract = await contractCall(tokenAddress, ERC20Contract.symbol.getData())
    const symbol = returnDataToHumanReadable(symbolFromContract)
    return symbol ? {symbol} : {}
  }

  const getTokenDecimals = async (tokenAddress: string): Promise<Partial<Token>> => {
    const decimalsFromContract = await contractCall(tokenAddress, ERC20Contract.decimals.getData())
    const decimals = new BigNumber(decimalsFromContract)
    return decimalsFromContract !== '0x' && decimals.isFinite()
      ? {decimals: decimals.toNumber()}
      : {}
  }

  const getTokenInfo = async (tokenAddress: string): Promise<Partial<Token>> => {
    const tokenWithName = await getTokenName(tokenAddress)
    const tokenWithSymbol = await getTokenSymbol(tokenAddress)
    const tokenWithDecimals = await getTokenDecimals(tokenAddress)

    return {...tokenWithName, ...tokenWithSymbol, ...tokenWithDecimals}
  }

  return {
    tokens,
    addToken,
    removeToken,
    reset,
    sendToken,
    isValidContract,
    getTokenInfo,
  }
}

export const TokensState = createContainer(useTokenState)

export const migrationsForTokensData = {
  '0.14.1-alpha.1': (store: Store<StoreTokensData>) => {
    store.set('tokens', {
      watched: {},
    })
  },
}
