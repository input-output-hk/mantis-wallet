import React from 'react'
import {Link} from 'react-router-dom'
import {ROUTES} from '../routes-config'
import './Sidebar.scss'

const Sidebar = (): JSX.Element => {
  return (
    <div className="Sidebar">
      <h1>Luna</h1>
      <nav>
        <ul>
          {Object.values(ROUTES).map((route) => (
            <li key={route.path}>
              <Link to={route.path}>{route.title}</Link>
            </li>
          ))}
        </ul>
      </nav>
      Support | Log Out
    </div>
  )
}

export default Sidebar
