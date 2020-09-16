import React from 'react'
import {Switch} from 'antd'
import {SettingsState} from './settings-state'
import './ApiTest.scss'

// FIXME: remove this component after every needed method is wired up with the real interface
export const ApiTest = (): JSX.Element => {
  const settingState = SettingsState.useContainer()

  return (
    <div className="ApiTest">
      <div className="main-title" style={{marginBottom: '1em'}}>
        Api Test Interface
      </div>

      <div style={{marginBottom: '1rem'}}>
        <h2>Settings</h2>
        <div className="input">
          <div className="label">Pseudo language</div>
          <Switch
            aria-label="Pseudo language"
            checked={settingState.isPseudoLanguageUsed}
            onChange={settingState.usePseudoLanguage}
          />
        </div>
      </div>
    </div>
  )
}
