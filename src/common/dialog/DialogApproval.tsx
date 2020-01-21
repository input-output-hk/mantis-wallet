import React from 'react'
import {Checkbox} from 'antd'
import './DialogApproval.scss'

interface DialogApprovalProps {
  description: string
  onChange: (checked: boolean) => void
  checked: boolean
}

export const DialogApproval: React.FunctionComponent<DialogApprovalProps> = ({
  description,
  onChange,
  checked,
}: DialogApprovalProps) => (
  <div className="DialogApproval">
    <Checkbox
      className="checkbox"
      checked={checked}
      onChange={(e): void => onChange(e.target.checked)}
    >
      {description}
    </Checkbox>
  </div>
)
