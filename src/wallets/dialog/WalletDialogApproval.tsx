import React from 'react'
import {Checkbox} from 'antd'
import './WalletDialogApproval.scss'

interface WalletDialogApprovalProps {
  description: string
  onChange: (checked: boolean) => void
  checked: boolean
}

export const WalletDialogApproval: React.FunctionComponent<WalletDialogApprovalProps> = ({
  description,
  onChange,
  checked,
}: WalletDialogApprovalProps) => (
  <div className="WalletDialogApproval">
    <Checkbox
      className="checkbox"
      checked={checked}
      onChange={(e): void => onChange(e.target.checked)}
    >
      {description}
    </Checkbox>
  </div>
)
