import classnames from 'classnames'
import React, {useEffect, useState} from 'react'
import _ from 'lodash/fp'
import {SplashScreen} from './SplashScreen'
import {BackendState, defaultBackendData, StoreBackendData} from './common/backend-state'
import {rendererLog} from './common/logger'
import {createPersistentStore, Store} from './common/store'
import {
  WalletState,
  defaultWalletData,
  StoreWalletData,
  migrationsForWalletData,
} from './common/wallet-state'
import {ipcListenToMain, ipcRemoveAllListeners} from './common/ipc-util'
import {config} from './config/renderer'
import {Router} from './layout/Router'
import {Sidebar} from './layout/Sidebar'
import {RouterState} from './router-state'
import {SettingsState, defaultSettingsData, StoreSettingsData} from './settings-state'
import {TokensState, defaultTokensData, StoreTokensData} from './tokens/tokens-state'
import {TransactionHistoryService} from './wallets/history'
import {createWeb3} from './web3'
import './App.scss'

const web3 = createWeb3(config.rpcAddress)

// TODO(ETCM-515): move migrations and default data related code after restructuring store/state related code

export type StoreData = StoreWalletData & StoreSettingsData & StoreTokensData & StoreBackendData

const defaultData: StoreData = _.mergeAll([
  defaultWalletData,
  defaultSettingsData,
  defaultTokensData,
  defaultBackendData,
])

const mergeMigrations = _.mergeAllWith(
  (
    objValue: undefined | ((store: Store<StoreData>) => void),
    srcValue: (store: Store<StoreData>) => void,
  ) => {
    if (objValue === undefined) {
      return srcValue
    } else {
      return (store: Store<StoreData>): void => {
        objValue.call(undefined, store)
        srcValue.call(undefined, store)
      }
    }
  },
)

const migrations = mergeMigrations([migrationsForWalletData])
const store = createPersistentStore({defaults: defaultData, migrations})

const AppContent: React.FC = () => {
  useEffect(() => {
    rendererLog.info('Mantis Wallet renderer started')
  }, [])

  const backendState = BackendState.useContainer()
  const {
    currentRoute: {menu},
  } = RouterState.useContainer()

  const [txHistory, setTxHistory] = useState<TransactionHistoryService | undefined>(undefined)

  useEffect(() => {
    TransactionHistoryService.create(web3, store, rendererLog).then((txHistory) => {
      setTxHistory(txHistory)
    })
  }, [])

  useEffect(() => {
    ipcListenToMain('store-changed', () => {
      rendererLog.debug('store-changed event')
      // FIXME: "watch" option is mostly broken, see: https://github.com/sindresorhus/conf/issues/108
      // This is a hack to force electron store to update its contents
      store.set('networkName', store.get('networkName'))
    })

    return () => ipcRemoveAllListeners('store-changed')
  })

  return backendState.isBackendRunning && txHistory ? (
    <div className={classnames('loaded', menu.toLowerCase())}>
      <WalletState.Provider
        initialState={{
          web3,
          store,
          backendState,
          txHistory,
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
