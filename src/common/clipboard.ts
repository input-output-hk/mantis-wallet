import {message} from 'antd'
import {wait} from '../shared/utils'

export const copyToClipboard = async (text: string, successMessage: string): Promise<void> => {
  await wait(500)
  await navigator.clipboard.writeText(text)

  message.success(successMessage)
}
