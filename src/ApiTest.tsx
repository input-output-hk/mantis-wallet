import React from 'react'
import {Switch} from 'antd'
import {_SettingsState} from './common/store/settings'
import './ApiTest.scss'

export const ApiTest = (): JSX.Element => {
  const settingState = _SettingsState.useContainer()

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
