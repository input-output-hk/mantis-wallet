import React from 'react'
import {BorderlessInputPassword} from '../BorderlessInputPassword'
import './DialogPassword.scss'

export const DialogPassword: React.FunctionComponent<{}> = () => (
  <div className="DialogPassword">
    <div className="label">Enter Password</div>
    <div className="inputs">
      <BorderlessInputPassword className="input" visibilityToggle={false} />
      <BorderlessInputPassword className="input" visibilityToggle={false} />
    </div>
    <div className="criteria">Password acceptance criteria</div>
  </div>
)
