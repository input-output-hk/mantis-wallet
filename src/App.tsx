import React, {useState, useEffect} from 'react'
import {BrowserRouter, Route, Redirect} from 'react-router-dom'
import {WalletState} from './common/wallet-state'
import {ProofOfBurnState} from './pob/pob-state'
import {ROUTES} from './routes-config'
import {Sidebar} from './layout/Sidebar'
import {SplashScreen} from './SplashScreen'
import {SyncStatus} from './common/SyncStatus'
import {web3} from './web3'
import './App.scss'

const App: React.FC = () => {
  const [isBackendRunning, setBackendRunning] = useState(false)

  useEffect(() => {
    const checkBackend = async (): Promise<void> => {
      try {
        await Promise.all([web3.midnight.wallet.listAccounts(), web3.version.ethereum])
        setBackendRunning(true)
        setTimeout(checkBackend, 5000)
      } catch (e) {
        setBackendRunning(false)
        setTimeout(checkBackend, 1000)
      }
    }

    checkBackend()
  }, [])

  return isBackendRunning ? (
    <div className="App">
      <BrowserRouter>
        <Redirect exact from="/" to={ROUTES.WALLETS.path} />
        <WalletState.Provider>
          <header className="App-header">
            <Sidebar />
          </header>
          <main>
            <ProofOfBurnState.Provider>
              <SyncStatus />
              {Object.values(ROUTES).map((route) => (
                <Route exact key={route.path} path={route.path} component={route.component} />
              ))}
            </ProofOfBurnState.Provider>
          </main>
        </WalletState.Provider>
      </BrowserRouter>
    </div>
  ) : (
    <SplashScreen />
  )
}

export default App
