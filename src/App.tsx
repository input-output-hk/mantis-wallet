import React from 'react'
import {createPersistentStore} from './common/store'
import {WalletState} from './common/wallet-state'
import {BackendState} from './common/backend-state'
import {SettingsState} from './settings-state'
import {RouterState} from './router-state'
import {TokensState} from './tokens/tokens-state'
import {Router} from './layout/Router'
import {Sidebar} from './layout/Sidebar'
import {SplashScreen} from './SplashScreen'
import {MANTIS_WALLET_VERSION} from './shared/version'
import {config} from './config/renderer'
import {createWeb3} from './web3'
import './App.scss'

const web3 = createWeb3(config.rpcAddress)
const store = createPersistentStore()

const AppContent: React.FC = () => {
  const {isBackendRunning} = BackendState.useContainer()
  return isBackendRunning ? (
    <div className="App">
      <RouterState.Provider>
        <WalletState.Provider initialState={{web3, store}}>
          <TokensState.Provider initialState={{web3, store}}>
            <Sidebar version={MANTIS_WALLET_VERSION} />
            <Router />
          </TokensState.Provider>
        </WalletState.Provider>
      </RouterState.Provider>
    </div>
  ) : (
    <SplashScreen />
  )
}

const App: React.FC = () => {
  return (
    <BackendState.Provider initialState={{web3, store}}>
      <SettingsState.Provider initialState={{store}}>
        <AppContent />
      </SettingsState.Provider>
    </BackendState.Provider>
  )
}

export default App
