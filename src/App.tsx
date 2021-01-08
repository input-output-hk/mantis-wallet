import React from 'react'
import classnames from 'classnames'
import {RouterState} from './router-state'
import {Router} from './layout/Router'
import {Sidebar} from './layout/Sidebar'
import {SplashScreen} from './SplashScreen'
import {config} from './config/renderer'
import {createWeb3} from './web3'
import './App.scss'
import {createPersistentStore} from './common/store/store'
import {WalletState} from './common/store/wallet'
import {_BackendState} from './common/store/backend'
import {_SettingsState} from './common/store/settings'

const web3 = createWeb3(config.rpcAddress)
const store = createPersistentStore()

const AppContent: React.FC = () => {
  const {isBackendRunning} = _BackendState.useContainer()
  const {
    currentRoute: {menu},
  } = RouterState.useContainer()

  return isBackendRunning ? (
    <div className={classnames('loaded', menu.toLowerCase())}>
      <WalletState.Provider initialState={{web3, store}}>
        <Sidebar />
        {/* FIXME: ETCM-404 version={MANTIS_WALLET_VERSION} /> */}
        <Router />
      </WalletState.Provider>
    </div>
  ) : (
    <SplashScreen />
  )
}

const App: React.FC = () => {
  return (
    <div id="App">
      <_BackendState.Provider initialState={{web3, store}}>
        <_SettingsState.Provider initialState={{store}}>
          <RouterState.Provider>
            <AppContent />
          </RouterState.Provider>
        </_SettingsState.Provider>
      </_BackendState.Provider>
    </div>
  )
}

export default App
