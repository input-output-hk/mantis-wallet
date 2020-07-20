import React from 'react'
import _ from 'lodash/fp'
import {message} from 'antd'
import {MessageType, ConfigOnClose} from 'antd/lib/message'
import {fillActionHandlers} from './util'
import './DismissableMessage.scss'

export type DismissFunction = () => MessageType | null
type MsgContent = ({dismiss}: {dismiss: DismissFunction}) => JSX.Element
type NoticeType = 'info' | 'success' | 'error' | 'warning' | 'loading'

interface Config {
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
  type: NoticeType,
  Content: MsgContent,
  config: Partial<Config> = DEFAULT_CONFIG,
): DismissFunction => {
  const {duration, onClose} = _.merge(DEFAULT_CONFIG)(config)

  const randomKey = Math.random()
    .toString(36)
    .substring(2, 15)

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
          Dismiss
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
