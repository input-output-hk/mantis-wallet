import React from 'react'
import SVG from 'react-inlinesvg'
import {DisplayChain} from '../pob/chains'
import './Token.scss'

type TokenProps<T extends DisplayChain> = {
  chain: T
  chooseChain: (chain: T) => void
}

export const Token = <T extends DisplayChain>({
  chain,
  chooseChain,
  children,
}: React.PropsWithChildren<TokenProps<T>>): JSX.Element => (
  <div className="Token" onClick={() => chooseChain(chain)}>
    <SVG src={chain.logo} className="logo" />
    <div className="footer">
      <span className="footer-text">{children}</span>
    </div>
  </div>
)
