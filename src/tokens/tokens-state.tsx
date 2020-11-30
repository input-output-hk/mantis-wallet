import {createContainer} from 'unstated-next'
import _ from 'lodash/fp'
import BigNumber from 'bignumber.js'
import {createInMemoryStore, Store} from '../common/store'
import {usePersistedState} from '../common/hook-utils'
import {createTErrorRenderer} from '../common/i18n'
import {returnDataToHumanReadable} from '../common/util'
import {rendererLog} from '../common/logger'
import {defaultWeb3, MantisWeb3} from '../web3'

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
  web3: MantisWeb3
}

export const defaultTokensData = {
  tokens: {
    watched: {},
  },
}

function useTokenState(
  {store, web3}: TokensInitialState = {
    store: createInMemoryStore(defaultTokensData),
    web3: defaultWeb3(),
  },
): TokensData {
  const [tokens, setTokens] = usePersistedState(store, ['tokens', 'watched'])

  const contractCall = async (tokenAddress: string, data: string): Promise<string> =>
    web3.eth.call(
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
        'ERC20Contract.balanceOf.getData(bech32toHex(tokenAddress))',
      )
      const totalSupply = await contractCall(tokenAddress, 'ERC20Contract.totalSupply.getData()')
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
    // FIXME ETCM-115 finish this for mantis and test tokens in overall
    rendererLog.log(token, senderAddress, recipientAddress, amount, fee)
  }

  const getTokenName = async (tokenAddress: string): Promise<Partial<Token>> => {
    const nameFromContract = await contractCall(tokenAddress, 'ERC20Contract.name.getData()')
    const name = returnDataToHumanReadable(nameFromContract)
    return name ? {name} : {}
  }

  const getTokenSymbol = async (tokenAddress: string): Promise<Partial<Token>> => {
    const symbolFromContract = await contractCall(tokenAddress, 'ERC20Contract.symbol.getData()')
    const symbol = returnDataToHumanReadable(symbolFromContract)
    return symbol ? {symbol} : {}
  }

  const getTokenDecimals = async (tokenAddress: string): Promise<Partial<Token>> => {
    const decimalsFromContract = await contractCall(
      tokenAddress,
      'ERC20Contract.decimals.getData()',
    )
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
