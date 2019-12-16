import React from 'react'
import {WalletOverview} from './WalletOverview'
import './Wallets.scss'

const Wallets = (): JSX.Element => {
  return (
    <div className="Wallets">
      <div className="list">
        <ul className="wallet-links">
          {[...Array(10).keys()].slice(1).map((n) => (
            <li key={n} className={`wallet-link${n === 1 ? ' wallet-link-first' : ''}`}>
              WALLET {n}
            </li>
          ))}
        </ul>
      </div>
      <div className="content">
        <WalletOverview pending={3815.62} confidental={15262.46} transparent={6359.36} />
        <div className="details">
          <ul>
            {[...Array(10).keys()].slice(1).map((n) => (
              <li key={n} className="wallet-link" style={{lineHeight: '60px'}}>
                Transaction {n}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Wallets
