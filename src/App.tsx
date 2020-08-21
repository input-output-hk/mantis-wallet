import React, {useState, useEffect} from 'react'
import {makeWeb3Worker} from './web3'
import {createPersistentStore} from './common/store'
import {WalletState} from './common/wallet-state'
import {BackendState} from './common/backend-state'
import {SettingsState} from './settings-state'
import {ProofOfBurnState} from './pob/pob-state'
import {GlacierState} from './glacier-drop/glacier-state'
import {RouterState} from './router-state'
import {BuildJobState} from './common/build-job-state'
import {TokensState} from './tokens/tokens-state'
import {JobStatus} from './common/JobStatus'
import {Router} from './layout/Router'
import {Sidebar} from './layout/Sidebar'
import {SplashScreen} from './SplashScreen'
import {RemoteSettingsManager} from './RemoteSettingsManager'
import {LUNA_VERSION} from './shared/version'
import {rendererLog} from './common/logger'
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
        setTimeout(checkBackend, 5000)
      } catch (e) {
        setBackendRunning(false)
        setTimeout(checkBackend, 1000)
      }
    }

    rendererLog.info('Luna renderer started')
    checkBackend()
  }, [])

  return (
    <SettingsState.Provider initialState={{store}}>
      <BackendState.Provider initialState={{web3}}>
        {isBackendRunning ? (
          <div className="App">
            <RouterState.Provider>
              <BuildJobState.Provider initialState={{web3}}>
                <WalletState.Provider initialState={{web3}}>
                  <ProofOfBurnState.Provider initialState={{store, web3}}>
                    <GlacierState.Provider initialState={{store}}>
                      <TokensState.Provider initialState={{store, web3}}>
                        <Sidebar version={LUNA_VERSION} />
                        <Router />
                        <JobStatus />
                      </TokensState.Provider>
                    </GlacierState.Provider>
                  </ProofOfBurnState.Provider>
                </WalletState.Provider>
              </BuildJobState.Provider>
            </RouterState.Provider>
            <RemoteSettingsManager setBackendRunning={setBackendRunning} />
          </div>
        ) : (
          <SplashScreen />
        )}
      </BackendState.Provider>
    </SettingsState.Provider>
  )
}

export default App
