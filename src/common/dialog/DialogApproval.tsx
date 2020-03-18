import React from 'react'
import {Checkbox} from 'antd'
import './DialogApproval.scss'

interface DialogApprovalProps {
  description: React.ReactNode
  onChange: (checked: boolean) => void
  checked: boolean
}

export const DialogApproval = ({
  description,
  onChange,
  checked,
  children,
}: React.PropsWithChildren<DialogApprovalProps>): JSX.Element => (
  <div className="DialogApproval">
    {children && <div className="extra">{children}</div>}
    <Checkbox
      className="checkbox"
      checked={checked}
      onChange={(e): void => onChange(e.target.checked)}
    >
      {description}
    </Checkbox>
  </div>
)
