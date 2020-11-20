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

const web3 = createWeb3(config.rpcAddress)
const store = createPersistentStore()

const AppContent: React.FC = () => {
  const {isBackendRunning} = BackendState.useContainer()
  const {
    currentRoute: {menu},
  } = RouterState.useContainer()

  return isBackendRunning ? (
    <div className={classnames('App', menu.toLowerCase())}>
      <WalletState.Provider initialState={{web3, store}}>
        <TokensState.Provider initialState={{web3, store}}>
          <Sidebar />
          {/* FIXME: version={MANTIS_WALLET_VERSION} /> */}
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
    <BackendState.Provider initialState={{web3, store}}>
      <SettingsState.Provider initialState={{store}}>
        <RouterState.Provider>
          <AppContent />
        </RouterState.Provider>
      </SettingsState.Provider>
    </BackendState.Provider>
  )
}

export default App
