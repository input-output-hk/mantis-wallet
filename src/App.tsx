import React, {useState, useEffect} from 'react'
import {makeWeb3Worker} from './web3'
import {createPersistentStore} from './common/store'
import {WalletState} from './common/wallet-state'
import {MiningState} from './common/mining-state'
import {ThemeState} from './theme-state'
import {ProofOfBurnState} from './pob/pob-state'
import {GlacierState} from './glacier-drop/glacier-state'
import {RouterState} from './router-state'
import {BuildJobState} from './common/build-job-state'
import {JobStatus} from './common/JobStatus'
import {Router} from './layout/Router'
import {Sidebar} from './layout/Sidebar'
import {SplashScreen} from './SplashScreen'
import {RemoteSettingsManager} from './RemoteSettingsManager'
import {LUNA_EDITION, LUNA_VERSION} from './shared/version'
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
      <MiningState.Provider initialState={{web3}}>
        {isBackendRunning ? (
          <div className="App">
            <RouterState.Provider>
              <BuildJobState.Provider initialState={{web3}}>
                <WalletState.Provider>
                  <ProofOfBurnState.Provider initialState={{store, web3}}>
                    <GlacierState.Provider initialState={{store}}>
                      <header>
                        <Sidebar version={[LUNA_VERSION, LUNA_EDITION]} />
                      </header>
                      <main id="main">
                        <Router />
                      </main>
                      <JobStatus />
                    </GlacierState.Provider>
                  </ProofOfBurnState.Provider>
                </WalletState.Provider>
              </BuildJobState.Provider>
            </RouterState.Provider>
            <RemoteSettingsManager />
          </div>
        ) : (
          <SplashScreen />
        )}
      </MiningState.Provider>
    </ThemeState.Provider>
  )
}

export default App
