import React, {PropsWithChildren} from 'react'
import SVG from 'react-inlinesvg'
import {Chain} from './chains'
import {fillActionHandlers} from './util'
import './Token.scss'

type TokenProps<T extends Chain> = {
  chain: T
  chooseChain: (chain: T) => void
}

export const Token = <T extends Chain>({
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
