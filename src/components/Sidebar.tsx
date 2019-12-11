import React from 'react'
import {NavLink} from 'react-router-dom'
import {ROUTES} from '../routes-config'
import './Sidebar.scss'

const Sidebar = (): JSX.Element => {
  return (
    <div className="Sidebar">
      <div className="logo">
        <img src="/logo.svg" alt="logo" />
      </div>
      <div className="title">
        <h1>Luna</h1>
      </div>
      <div className="navigation">
        <nav>
          <ul>
            {Object.values(ROUTES).map((route) => (
              <li key={route.path}>
                <NavLink to={route.path}>
                  <span className="prefix">&nbsp;</span>
                  <span className="icon">
                    &nbsp;
                    <img src={`/icons/${route.icon}`} alt={route.title} />
                  </span>
                  <span>{route.title}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="footer">Support | Log Out</div>
    </div>
  )
}

export default Sidebar
