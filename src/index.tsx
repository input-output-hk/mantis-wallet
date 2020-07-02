import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import {rendererLog} from './common/logger'
import './index.scss'

rendererLog.info('Luna renderer started')

ReactDOM.render(<App />, document.getElementById('root'))
