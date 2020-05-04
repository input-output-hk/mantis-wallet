import React, {useState} from 'react'
import classnames from 'classnames'
import {Button} from 'antd'
import {ButtonProps} from 'antd/lib/button'
import {useIsMounted} from './hook-utils'
import {DialogError} from './dialog/DialogError'
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
  onSetLoading?: (loading: boolean) => void
  footer?: React.ReactNode
}

export const Dialog: React.FunctionComponent<DialogProps> = ({
  title,
  type = 'normal',
  buttonDisplayMode = 'grid',
  rightButtonProps: {doNotRender: doNotRenderRight = false, ...rightButtonProps} = {},
  leftButtonProps: {doNotRender: doNotRenderLeft = false, ...leftButtonProps} = {},
  children,
  onSetLoading,
  footer,
}: React.PropsWithChildren<DialogProps>) => {
  const [leftInProgress, setLeftInProgress] = useState(false)
  const [rightInProgress, setRightInProgress] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const mounted = useIsMounted()

  const createHandleClick = (
    {onClick}: ButtonProps,
    setInProgress: (inProgress: boolean) => void,
  ) => async (event: React.MouseEvent<HTMLElement, MouseEvent>): Promise<void> => {
    if (onClick) {
      setInProgress(true)
      onSetLoading?.(true)
      try {
        await onClick(event)
      } catch (e) {
        console.error(e)
        if (mounted.current) setErrorMessage(e.message)
      } finally {
        if (mounted.current) setInProgress(false)
        onSetLoading?.(false)
      }
    }
  }

  const leftButtonPropsToUse: ButtonProps = {
    size: 'large',
    loading: leftInProgress,
    children: 'Cancel',
    ...leftButtonProps,
    onClick: createHandleClick(leftButtonProps, setLeftInProgress),
  }

  const rightButtonPropsToUse: ButtonProps = {
    type: 'primary',
    htmlType: 'submit',
    size: 'large',
    children: 'Next →',
    loading: rightInProgress,
    ...rightButtonProps,
    onClick: createHandleClick(rightButtonProps, setRightInProgress),
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
      {(footer || errorMessage) && (
        <div className="footer">
          {footer}
          {errorMessage && <DialogError>{errorMessage}</DialogError>}
        </div>
      )}
    </div>
  )
}
