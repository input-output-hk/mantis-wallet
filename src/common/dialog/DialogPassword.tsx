import React from 'react'
import {BorderlessInputPassword} from '../BorderlessInput'
import {DialogColumns} from './DialogColumns'
import './DialogPassword.scss'

export const DialogPassword: React.FunctionComponent<{}> = () => (
  <div className="DialogPassword">
    <div className="label">Enter Password</div>
    <DialogColumns>
      <BorderlessInputPassword className="input" visibilityToggle={false} />
      <BorderlessInputPassword className="input" visibilityToggle={false} />
    </DialogColumns>
    <div className="criteria">Password acceptance criteria</div>
  </div>
)
