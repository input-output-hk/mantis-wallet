import React from 'react'
import classnames from 'classnames'
import {Button} from 'antd'
import {ButtonProps} from 'antd/lib/button'
import './Dialog.scss'

interface DialogButtonProps {
  doNotRender?: boolean
}

interface DialogProps {
  title?: React.ReactNode
  type?: 'normal' | 'dark'
  buttonDisplayMode?: 'natural' | 'grid'
  leftButtonProps?: ButtonProps & DialogButtonProps
  rightButtonProps?: ButtonProps & DialogButtonProps
  footer?: React.ReactNode
}

export const Dialog: React.FunctionComponent<DialogProps> = ({
  title,
  type = 'normal',
  buttonDisplayMode = 'grid',
  rightButtonProps: {doNotRender: doNotRenderRight = false, ...rightButtonProps} = {},
  leftButtonProps: {doNotRender: doNotRenderLeft = false, ...leftButtonProps} = {},
  children,
  footer,
}: React.PropsWithChildren<DialogProps>) => {
  const leftButtonPropsToUse: ButtonProps = {
    size: 'large',
    children: 'Cancel',
    ...leftButtonProps,
  }

  const rightButtonPropsToUse: ButtonProps = {
    type: 'primary',
    htmlType: 'submit',
    size: 'large',
    children: 'Next →',
    ...rightButtonProps,
  }

  return (
    <div className={classnames('Dialog', type)}>
      {title && <div className="title">{title}</div>}
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="dialog-children">{children}</div>
        <div className={classnames('actions', buttonDisplayMode)}>
          {!doNotRenderLeft && <Button {...leftButtonPropsToUse} />}
          {!doNotRenderRight && <Button {...rightButtonPropsToUse} />}
        </div>
      </form>
      {footer && <div className="footer">{footer}</div>}
    </div>
  )
}
