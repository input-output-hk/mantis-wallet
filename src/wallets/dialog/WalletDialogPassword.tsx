import React from 'react'
import {BorderlessInputPassword} from '../../components/BorderlessInputPassword'
import './WalletDialogPassword.scss'

export const WalletDialogPassword: React.FunctionComponent<{}> = () => (
  <div className="WalletDialogPassword">
    <div className="label">Enter Password</div>
    <div className="inputs">
      <BorderlessInputPassword className="input" visibilityToggle={false} />
      <BorderlessInputPassword className="input" visibilityToggle={false} />
    </div>
    <div className="criteria">Password acceptance criteria</div>
  </div>
)
