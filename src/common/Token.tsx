import React, {PropsWithChildren} from 'react'
import SVG from 'react-inlinesvg'
import {DisplayChain} from '../pob/chains'
import {fillActionHandlers} from './util'
import './Token.scss'

type TokenProps<T extends DisplayChain> = {
  chain: T
  chooseChain: (chain: T) => void
}

export const Token = <T extends DisplayChain>({
  chain,
  chooseChain,
  children,
}: PropsWithChildren<TokenProps<T>>): JSX.Element => (
  <div className="Token" {...fillActionHandlers(() => chooseChain(chain))}>
    <SVG src={chain.logo} className="logo" />
    <div className="footer">
      <span className="footer-text">{children}</span>
    </div>
  </div>
)
