import React, {useState, useEffect} from 'react'
import {WalletState} from './common/wallet-state'
import {ThemeState} from './theme-state'
import {ProofOfBurnState} from './pob/pob-state'
import {RouterState} from './router-state'
import {Router} from './layout/Router'
import {Sidebar} from './layout/Sidebar'
import {FloatingSyncStatus} from './common/SyncStatus'
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
        setTimeout(checkBackend, 5000)
      } catch (e) {
        setBackendRunning(false)
        setTimeout(checkBackend, 1000)
      }
    }

    checkBackend()
  }, [])

  return (
    <ThemeState.Provider>
      {isBackendRunning ? (
        <div className="App">
          <RouterState.Provider>
            <WalletState.Provider>
              <header>
                <Sidebar />
              </header>
              <FloatingSyncStatus />
              <ProofOfBurnState.Provider>
                <main id="main">
                  <Router />
                </main>
              </ProofOfBurnState.Provider>
            </WalletState.Provider>
          </RouterState.Provider>
        </div>
      ) : (
        <SplashScreen />
      )}
    </ThemeState.Provider>
  )
}

export default App
