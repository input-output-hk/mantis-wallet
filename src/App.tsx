import React from 'react'
import {BrowserRouter as Router, Route} from 'react-router-dom'
import {ROUTES} from './routes-config'
import Sidebar from './components/Sidebar'
import './App.scss'

const App: React.FC = () => {
  return (
    <div className="App">
      <Router>
        <header className="App-header">
          <Sidebar />
        </header>
        <main>
          <Route path={ROUTES.PORTFOLIO}>Portfolio</Route>
          <Route path={ROUTES.WALLETS}>Wallets</Route>
          <Route path={ROUTES.PROOF_OF_BURN}>Proof of Burn</Route>
          <Route path={ROUTES.GLACIER_DROP}>Glacier Drop</Route>
          <Route path={ROUTES.SETTINGS}>Settings</Route>
        </main>
      </Router>
    </div>
  )
}

export default App
