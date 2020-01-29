import React, {useEffect, useState} from 'react'
import {BrowserRouter, Route} from 'react-router-dom'
import {WalletState} from './common/wallet-state'
import {ROUTES} from './routes-config'
import {Sidebar} from './layout/Sidebar'
import {SplashScreen} from './SplashScreen'
import './App.scss'
import {wallet} from './wallet'

const App: React.FC = () => {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    setTimeout(() => setLoaded(true), 1500)
  }, [])

  return loaded ? (
    <div className="App">
      <BrowserRouter>
        <header className="App-header">
          <Sidebar />
        </header>
        <main>
          <WalletState.Provider initialState={wallet}>
            {Object.values(ROUTES).map((route) => (
              <Route key={route.path} path={route.path} component={route.component} />
            ))}
          </WalletState.Provider>
        </main>
      </BrowserRouter>
    </div>
  ) : (
    <SplashScreen />
  )
}

export default App
