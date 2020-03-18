import {message} from 'antd'

export const copyToClipboard = async (text: string): Promise<void> => {
  await navigator.clipboard.writeText(text)

  message.success('Successfully copied to clipboard.')
}
