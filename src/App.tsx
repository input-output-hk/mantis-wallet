import React from 'react'
import classnames from 'classnames'
import {createPersistentStore} from './common/store'
import {WalletState} from './common/wallet-state'
import {BackendState} from './common/backend-state'
import {SettingsState} from './settings-state'
import {RouterState} from './router-state'
import {TokensState} from './tokens/tokens-state'
import {Router} from './layout/Router'
import {Sidebar} from './layout/Sidebar'
import {SplashScreen} from './SplashScreen'
import {config} from './config/renderer'
import {createWeb3} from './web3'
import './App.scss'
import {TransactionHistoryService} from './wallets/history'
import {rendererLog} from './common/logger'

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
