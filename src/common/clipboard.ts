import {message} from 'antd'

export const copyToClipboard = async (text: string, successMessage: string): Promise<void> => {
  await navigator.clipboard.writeText(text)

  message.success(successMessage)
}
