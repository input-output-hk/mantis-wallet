import React, {useState, useEffect} from 'react'
import {BrowserRouter, Route} from 'react-router-dom'
import {WalletState} from './common/wallet-state'
import {ROUTES} from './routes-config'
import {Sidebar} from './layout/Sidebar'
import {SplashScreen} from './SplashScreen'
import {web3} from './web3'
import './App.scss'

const App: React.FC = () => {
  const [isBackendRunning, setBackendRunning] = useState(false)

  useEffect(() => {
    const checkBackend = async (): Promise<void> => {
      try {
        await Promise.all([web3.midnight.wallet.listAccounts(), web3.version.ethereum])
        setBackendRunning(true)
      } catch (e) {
        setBackendRunning(false)
      } finally {
        setTimeout(checkBackend, 1000)
      }
    }

    checkBackend()
  }, [])

  return isBackendRunning ? (
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
  ) : (
    <SplashScreen />
  )
}

export default App
