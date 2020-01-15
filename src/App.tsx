import React from 'react'
import {BrowserRouter, Route} from 'react-router-dom'
import {ROUTES} from './routes-config'
import {Sidebar} from './components/Sidebar'
import './App.scss'

const App: React.FC = () => {
  return (
    <div className="App">
      <BrowserRouter>
        <header className="App-header">
          <Sidebar />
        </header>
        <main>
          {Object.values(ROUTES).map((route) => (
            <Route key={route.path} path={route.path} component={route.component} />
          ))}
        </main>
      </BrowserRouter>
    </div>
  )
}

export default App
