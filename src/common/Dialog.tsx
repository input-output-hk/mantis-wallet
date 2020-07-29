import React, {useState, ReactNode, PropsWithChildren, FunctionComponent} from 'react'
import classnames from 'classnames'
import _ from 'lodash'
import Schema from 'async-validator'
import {Button, Form} from 'antd'
import {ButtonProps} from 'antd/lib/button'
import {FormInstance} from 'antd/lib/form'
import {createContainer} from 'unstated-next'
import {useIsMounted} from './hook-utils'
import {DialogError} from './dialog/DialogError'
import {waitUntil} from '../shared/utils'
import {rendererLog} from './logger'
import './Dialog.scss'

// https://github.com/yiminghe/async-validator/#how-to-avoid-warning
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
Schema.warning = () => undefined // eslint-disable-line fp/no-mutation

export const DIALOG_VALIDATION_ERROR =
  'Some fields require additional action before you can continue.'

interface DialogButtonProps {
  doNotRender?: boolean
  skipValidation?: boolean
}

interface DialogProps {
  title?: ReactNode
  type?: 'normal' | 'dark'
  buttonDisplayMode?: 'natural' | 'grid' | 'wide'
  leftButtonProps?: ButtonProps & DialogButtonProps
  rightButtonProps?: ButtonProps & DialogButtonProps
  onSetLoading?: (loading: boolean) => void
  footer?: ReactNode
  helpURL?: string | null
  className?: string
}

export interface DialogState {
  dialogForm: FormInstance
  errorMessage: string
  setErrorMessage: (errorMessage: string) => void
}

export const DialogState = createContainer(() => {
  const [errorMessage, setErrorMessage] = useState('')

  const [dialogForm] = Form.useForm()

  return {
    errorMessage,
    setErrorMessage,
    dialogForm,
  }
})

const _Dialog: FunctionComponent<DialogProps> = ({
  title,
  type = 'normal',
  buttonDisplayMode = 'grid',
  rightButtonProps: {
    doNotRender: doNotRenderRight = false,
    skipValidation: skipValidationRight = false,
    ...rightButtonProps
  } = {},
  leftButtonProps: {
    doNotRender: doNotRenderLeft = false,
    skipValidation: skipValidationLeft = true,
    ...leftButtonProps
  } = {},
  children,
  onSetLoading,
  footer,
  helpURL = null,
  className = '',
}: PropsWithChildren<DialogProps>) => {
  const {errorMessage, setErrorMessage, dialogForm} = DialogState.useContainer()

  const [leftInProgress, setLeftInProgress] = useState(false)
  const [rightInProgress, setRightInProgress] = useState(false)
  const mounted = useIsMounted()

  const createHandleClick = (
    {onClick}: ButtonProps,
    setInProgress: (inProgress: boolean) => void,
    skipValidation: boolean,
  ) => async (event: React.MouseEvent<HTMLElement, MouseEvent>): Promise<void> => {
    if (onClick) {
      setInProgress(true)
      onSetLoading?.(true)
      try {
        if (!skipValidation) {
          await waitUntil(() =>
            Promise.resolve(
              _.isEmpty(dialogForm.getFieldsValue(true, ({validating}) => validating)),
            ),
          )
          await dialogForm.validateFields().catch(() => {
            return Promise.reject(Error(DIALOG_VALIDATION_ERROR))
          })
        }
        await onClick(event)
      } catch (e) {
        if (e?.message !== DIALOG_VALIDATION_ERROR) rendererLog.error(e)
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
    onClick: createHandleClick(leftButtonProps, setLeftInProgress, skipValidationLeft),
  }

  const rightButtonPropsToUse: ButtonProps = {
    type: 'primary',
    htmlType: 'submit',
    size: 'large',
    children: 'Next',
    loading: rightInProgress,
    ...rightButtonProps,
    onClick: createHandleClick(rightButtonProps, setRightInProgress, skipValidationRight),
  }

  return (
    <div className={classnames('Dialog', type, ...className)}>
      {title && <div className="title">{title}</div>}
      <Form form={dialogForm} onValuesChange={() => setErrorMessage('')}>
        <div className="dialog-children">{children}</div>
        {(!doNotRenderLeft || !doNotRenderRight) && (
          <div className={classnames('actions', buttonDisplayMode)}>
            {!doNotRenderLeft && <Button data-testid="left-button" {...leftButtonPropsToUse} />}
            {!doNotRenderRight && <Button data-testid="right-button" {...rightButtonPropsToUse} />}
          </div>
        )}
      </Form>
      {(footer || errorMessage) && (
        <div className="footer">
          {footer}
          {errorMessage && <DialogError helpURL={helpURL}>{errorMessage}</DialogError>}
        </div>
      )}
    </div>
  )
}

export const Dialog: FunctionComponent<DialogProps> = (props) => (
  <DialogState.Provider>
    <_Dialog {...props} />
  </DialogState.Provider>
)
