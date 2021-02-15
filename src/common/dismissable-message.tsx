import React from 'react'
import _ from 'lodash/fp'
import {message} from 'antd'
import {MessageType, ConfigOnClose} from 'antd/lib/message'
import {fillActionHandlers} from './util'
import {TFunctionRenderer} from './i18n'
import './DismissableMessage.scss'

export type DismissFunction = () => MessageType | null
export type MsgContent = ({dismiss}: {dismiss: DismissFunction}) => JSX.Element
export type NoticeType = 'info' | 'success' | 'error' | 'warning' | 'loading'

export interface DismissableConfig {
  duration: number
  onClose: ConfigOnClose
}

const DEFAULT_CONFIG = {
  duration: 0,
  onClose: (): void => undefined,
}

/**
 * Creates a dismissable ANTD message
 *
 * @param type e.g. `success` or `failure`
 * @param Content React Component which receives a `dismiss` prop
 * @param config `{duration, onClose}`
 */
export const makeDismissableMessage = (
  t: TFunctionRenderer,
  type: NoticeType,
  Content: MsgContent,
  config: Partial<DismissableConfig> = {},
): DismissFunction => {
  const {duration, onClose} = _.merge(DEFAULT_CONFIG)(config)

  const randomKey = Math.random().toString(36).substring(2, 15)

  const partialOptions = {
    type,
    key: randomKey,
    className: 'DismissableMessage',
  }

  const DismissableMessage = ({dismiss}: {dismiss: DismissFunction}): JSX.Element => (
    <>
      <span className="content">
        <Content dismiss={dismiss} />
      </span>
      <div className="dismiss-wrapper">
        <span className="dismiss-link" {...fillActionHandlers(dismiss)}>
          {t(['common', 'button', 'dismissNotificationMessage'])}
        </span>
      </div>
    </>
  )

  // ANTD doesn't provide a way to dismiss a message:
  // The best we can do is to open a new message with the same key,
  // the new one replaces the previous one and disappears after
  // a really short time.
  const dismiss = (): MessageType =>
    message.open({
      ...partialOptions,
      duration: 0.01,
      onClose,
      content: <DismissableMessage dismiss={() => null} />,
    })

  message.open({
    ...partialOptions,
    duration,
    onClose,
    content: <DismissableMessage dismiss={dismiss} />,
  })

  return dismiss
}
