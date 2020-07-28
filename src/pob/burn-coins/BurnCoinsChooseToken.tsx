import React, {FunctionComponent} from 'react'
import {Button} from 'antd'
import {PobChain} from '../pob-chains'
import {Token} from '../../common/Token'
import './BurnCoinsChooseToken.scss'

interface BurnCoinsChooseTokenProps {
  chains: PobChain[]
  chooseChain: (chain: PobChain) => void
  cancel: () => void
}

export const BurnCoinsChooseToken: FunctionComponent<BurnCoinsChooseTokenProps> = ({
  chains,
  chooseChain,
  cancel,
}: BurnCoinsChooseTokenProps) => (
  <div className="BurnCoinsChooseToken">
    <div className="tokens">
      {chains.map((chain) => (
        <Token chain={chain} chooseChain={chooseChain} key={chain.id}>
          Burn {chain.name} for M-{chain.symbol}
        </Token>
      ))}
    </div>
    <Button onClick={cancel}>← Go Back</Button>
  </div>
)
