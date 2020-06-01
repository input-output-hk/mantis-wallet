import React from 'react'
import {Chain} from '../chains'
import {Token} from '../../common/Token'
import './BurnCoinsChooseToken.scss'

interface BurnCoinsChooseTokenProps {
  chains: Chain[]
  chooseChain: (chain: Chain) => void
}

export const BurnCoinsChooseToken: React.FunctionComponent<BurnCoinsChooseTokenProps> = ({
  chains,
  chooseChain,
}: BurnCoinsChooseTokenProps) => (
  <div className="BurnCoinsChooseToken">
    <div className="tokens">
      {chains.map((chain) => (
        <Token chain={chain} chooseChain={chooseChain} key={chain.id}>
          Burn {chain.name} for M-{chain.symbol}
        </Token>
      ))}
    </div>
  </div>
)
