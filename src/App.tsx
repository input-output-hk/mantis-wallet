import classnames from 'classnames'
import React from 'react'
import {SplashScreen} from './SplashScreen'
import {BackendState} from './common/backend-state'
import {rendererLog} from './common/logger'
import {createPersistentStore} from './common/store'
import {WalletState} from './common/wallet-state'
import {config} from './config/renderer'
import {Router} from './layout/Router'
import {Sidebar} from './layout/Sidebar'
import {RouterState} from './router-state'
import {SettingsState} from './settings-state'
import {TokensState} from './tokens/tokens-state'
import {TransactionHistoryService} from './wallets/history'
import {createWeb3} from './web3'
import './App.scss'

const web3 = createWeb3(config.rpcAddress)
const store = createPersistentStore()

const AppContent: React.FC = () => {
  const backendState = BackendState.useContainer()
  const {
    currentRoute: {menu},
  } = RouterState.useContainer()

  return backendState.isBackendRunning ? (
    <div className={classnames('loaded', menu.toLowerCase())}>
      <WalletState.Provider
        initialState={{
          web3,
          store,
          backendState,
          txHistory: TransactionHistoryService.create(web3, store, rendererLog),
        }}
      >
        <TokensState.Provider initialState={{web3, store}}>
          <Sidebar />
          {/* FIXME: ETCM-404 version={MANTIS_WALLET_VERSION} /> */}
          <Router />
        </TokensState.Provider>
      </WalletState.Provider>
    </div>
  ) : (
    <SplashScreen />
  )
}

const App: React.FC = () => {
  return (
    <div id="App">
      <BackendState.Provider initialState={{web3, store}}>
        <SettingsState.Provider initialState={{store}}>
          <RouterState.Provider>
            <AppContent />
          </RouterState.Provider>
        </SettingsState.Provider>
      </BackendState.Provider>
    </div>
  )
}

export default App
