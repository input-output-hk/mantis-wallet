import React, {FunctionComponent} from 'react'
import {Button} from 'antd'
import {PobChain} from '../pob-chains'
import {Token} from '../../common/Token'
import {Trans} from '../../common/Trans'
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
          <Trans k={chain.translations.burnFor} />
        </Token>
      ))}
    </div>
    <Button onClick={cancel}>
      <span>
        <Trans k={['common', 'button', 'goBackOneStep']} />
      </span>
    </Button>
  </div>
)
