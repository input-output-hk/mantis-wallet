import React from 'react'
import classnames from 'classnames'
import {Button} from 'antd'
import {ButtonProps} from 'antd/lib/button'
import './Dialog.scss'

interface DialogButtonProps {
  doNotRender?: boolean
}

interface DialogProps {
  title?: string
  type?: 'normal' | 'dark'
  buttonDisplayMode?: 'natural' | 'grid'
  prevButtonProps?: ButtonProps & DialogButtonProps
  nextButtonProps?: ButtonProps & DialogButtonProps
  footer?: React.ReactNode
}

export const Dialog: React.FunctionComponent<DialogProps> = ({
  title,
  type = 'normal',
  buttonDisplayMode = 'grid',
  nextButtonProps = {},
  prevButtonProps = {},
  children,
  footer,
}: React.PropsWithChildren<DialogProps>) => {
  const prevButtonPropsToUse: ButtonProps = {
    size: 'large',
    children: 'Cancel',
    ...prevButtonProps,
  }

  const nextButtonPropsToUse: ButtonProps = {
    type: 'primary',
    htmlType: 'submit',
    size: 'large',
    children: 'Next →',
    ...nextButtonProps,
  }

  return (
    <div className={classnames('Dialog', type)}>
      {title && <div className="title">{title}</div>}
      <form onSubmit={(e) => e.preventDefault()}>
        <div>{children}</div>
        <div className={classnames('actions', buttonDisplayMode)}>
          {!prevButtonProps.doNotRender && <Button {...prevButtonPropsToUse} />}
          {!nextButtonProps.doNotRender && <Button {...nextButtonPropsToUse} />}
        </div>
      </form>
      {footer && <div className="footer">{footer}</div>}
    </div>
  )
}
