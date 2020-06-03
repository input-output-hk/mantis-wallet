import React, {Ref, forwardRef} from 'react'
import {Checkbox} from 'antd'
import {CheckboxProps} from 'antd/lib/checkbox'
import './DialogApproval.scss'

interface DialogApprovalProps extends Omit<CheckboxProps, 'onChange'> {
  id?: string
  description: React.ReactNode
  onChange: (checked: boolean) => void
}

export const _DialogApproval: React.RefForwardingComponent<Checkbox, DialogApprovalProps> = (
  {id, description, onChange, children, ...rest}: React.PropsWithChildren<DialogApprovalProps>,
  ref: Ref<Checkbox>,
): JSX.Element => (
  <div className="DialogApproval">
    {children && <div className="extra">{children}</div>}
    <Checkbox
      id={id}
      className="checkbox"
      onChange={(e): void => onChange(e.target.checked)}
      {...rest}
      ref={ref}
    >
      {description}
    </Checkbox>
  </div>
)

export const DialogApproval = forwardRef(_DialogApproval)
