import React, {useState, useEffect} from 'react'
import {makeWeb3Worker} from './web3'
import {createPersistentStore} from './common/store'
import {WalletState} from './common/wallet-state'
import {ThemeState} from './theme-state'
import {ProofOfBurnState} from './pob/pob-state'
import {GlacierState} from './glacier-drop/glacier-state'
import {RouterState} from './router-state'
import {Router} from './layout/Router'
import {Sidebar} from './layout/Sidebar'
import {SplashScreen} from './SplashScreen'
import {RemoteSettingsManager} from './RemoteSettingsManager'
import './App.scss'

const web3 = makeWeb3Worker()
const store = createPersistentStore()

const App: React.FC = () => {
  const [isBackendRunning, setBackendRunning] = useState(false)

  useEffect(() => {
    const checkBackend = async (): Promise<void> => {
      try {
        await Promise.all([web3.midnight.wallet.listAccounts(), web3.version.ethereum])
        setBackendRunning(true)
        setTimeout(checkBackend, 2500)
      } catch (e) {
        setBackendRunning(false)
        setTimeout(checkBackend, 1000)
      }
    }

    checkBackend()
  }, [])

  return (
    <ThemeState.Provider initialState={store}>
      {isBackendRunning ? (
        <div className="App">
          <RouterState.Provider>
            <WalletState.Provider>
              <ProofOfBurnState.Provider initialState={{store, web3}}>
                <GlacierState.Provider initialState={{store}}>
                  <header>
                    <Sidebar />
                  </header>
                  <main id="main">
                    <Router />
                  </main>
                </GlacierState.Provider>
              </ProofOfBurnState.Provider>
            </WalletState.Provider>
          </RouterState.Provider>
          <RemoteSettingsManager />
        </div>
      ) : (
        <SplashScreen />
      )}
    </ThemeState.Provider>
  )
}

export default App
