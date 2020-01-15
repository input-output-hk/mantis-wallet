import React from 'react'
import {Tabs} from 'antd'
import {BorderlessInput} from '../../components/BorderlessInput'
import './WalletDialogSecurity.scss'

const {TabPane} = Tabs

interface WalletDialogSecurityProps {
  labels: Array<string>
}

export const WalletDialogSecurity: React.FunctionComponent<WalletDialogSecurityProps> = ({
  labels,
}: WalletDialogSecurityProps) => {
  return (
    <div className="WalletDialogSecurity">
      <Tabs>
        {labels.map((label) => (
          <TabPane key={label} tab={label}>
            <BorderlessInput className="input" />
          </TabPane>
        ))}
      </Tabs>
    </div>
  )
}
