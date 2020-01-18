import React from 'react'
import {BrowserRouter, Route} from 'react-router-dom'
import {WalletState} from './common/wallet-state'
import {ROUTES} from './routes-config'
import {Sidebar} from './layout/Sidebar'
import './App.scss'

const App: React.FC = () => {
  return (
    <div className="App">
      <BrowserRouter>
        <header className="App-header">
          <Sidebar />
        </header>
        <main>
          <WalletState.Provider>
            {Object.values(ROUTES).map((route) => (
              <Route key={route.path} path={route.path} component={route.component} />
            ))}
          </WalletState.Provider>
        </main>
      </BrowserRouter>
    </div>
  )
}

export default App
