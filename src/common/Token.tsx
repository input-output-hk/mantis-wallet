import React from 'react'
import SVG from 'react-inlinesvg'
import {Chain} from '../pob/chains'
import './Token.scss'

interface BurnCoinsChooseTokenProps {
  chain: Chain
  chooseChain: (chain: Chain) => void
}

export const Token: React.FunctionComponent<BurnCoinsChooseTokenProps> = ({
  chain,
  chooseChain,
  children,
}: React.PropsWithChildren<BurnCoinsChooseTokenProps>) => (
  <div className="Token" onClick={() => chooseChain(chain)}>
    <SVG src={chain.logo} className="logo" />
    <div className="footer">
      <span className="footer-text">{children}</span>
    </div>
  </div>
)
