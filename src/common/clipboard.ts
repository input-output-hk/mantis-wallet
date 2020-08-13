import {message} from 'antd'
import {wait} from '../shared/utils'
import {UI_DELAY} from './constants/ui'

export const copyToClipboard = async (text: string, successMessage: string): Promise<void> => {
  await navigator.clipboard.writeText(text)
  await wait(UI_DELAY)

  message.success(successMessage)
}
