import React, {useState, useEffect} from 'react'
import Web3 from 'web3'
import {createPersistentStore} from './common/store'
import {WalletState} from './common/wallet-state'
import {BackendState} from './common/backend-state'
import {SettingsState} from './settings-state'
import {RouterState} from './router-state'
import {TokensState} from './tokens/tokens-state'
import {Router} from './layout/Router'
import {Sidebar} from './layout/Sidebar'
import {SplashScreen} from './SplashScreen'
import {LUNA_VERSION} from './shared/version'
import {rendererLog} from './common/logger'
import {config} from './config/renderer'
import './App.scss'

const web3 = new Web3(new Web3.providers.HttpProvider(config.rpcAddress.href))
const store = createPersistentStore()

const App: React.FC = () => {
  const [isBackendRunning, setBackendRunning] = useState(false)

  useEffect(() => {
    const checkBackend = async (): Promise<void> => {
      try {
        await web3.eth.getProtocolVersion()
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
              <WalletState.Provider initialState={{web3, store}}>
                <TokensState.Provider initialState={{store, web3}}>
                  <Sidebar version={LUNA_VERSION} />
                  <Router />
                </TokensState.Provider>
              </WalletState.Provider>
            </RouterState.Provider>
          </div>
        ) : (
          <SplashScreen />
        )}
      </BackendState.Provider>
    </SettingsState.Provider>
  )
}

export default App
