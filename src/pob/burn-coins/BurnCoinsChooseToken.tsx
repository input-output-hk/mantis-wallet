import React from 'react'
import SVG from 'react-inlinesvg'
import {Chain} from '../chains'
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
    <div className="title">Wallet 01</div>
    <div className="tokens">
      {chains.map((chain) => (
        <div className="token" key={chain.id} onClick={() => chooseChain(chain)}>
          <SVG src={chain.logo} className="logo" />
          <div className="footer">
            <span className="footer-text">
              Burn {chain.name} for M-{chain.symbol}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
)
