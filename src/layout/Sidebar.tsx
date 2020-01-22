import React from 'react'
import {NavLink} from 'react-router-dom'
import SVG from 'react-inlinesvg'
import {ROUTES} from '../routes-config'
import './Sidebar.scss'

export const Sidebar = (): JSX.Element => {
  return (
    <div className="Sidebar">
      <div className="logo">
        <img src="./logo.svg" alt="logo" />
      </div>
      <div>
        <h1 className="title">Luna</h1>
      </div>
      <div>
        <nav>
          <ul className="navigation">
            {Object.values(ROUTES)
              .filter((route) => !route.hidden)
              .map((route) => (
                <li key={route.path}>
                  <NavLink to={route.path} className="link">
                    <span className="prefix">&nbsp;</span>
                    <span className="icon">
                      &nbsp;
                      <SVG className="svg" src={`./icons/${route.icon}`} />
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
