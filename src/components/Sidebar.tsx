import React from 'react'
import {Link} from 'react-router-dom'
import {ROUTES} from '../routes-config'
import './Sidebar.scss'

export default () => {
  return (
    <div className="Sidebar">
      <h1>Luna</h1>
      <nav>
        <ul>
          <li>
            <Link to={ROUTES.PORTFOLIO}>Portfolio</Link>
          </li>
          <li>
            <Link to={ROUTES.WALLETS}>Wallets</Link>
          </li>
          <li>
            <Link to={ROUTES.PROOF_OF_BURN}>Proof of Burn</Link>
          </li>
          <li>
            <Link to={ROUTES.GLACIER_DROP}>Glacier Drop</Link>
          </li>
          <li>
            <Link to={ROUTES.SETTINGS}>Settings</Link>
          </li>
        </ul>
      </nav>
      Support | Log Out
    </div>
  )
}
