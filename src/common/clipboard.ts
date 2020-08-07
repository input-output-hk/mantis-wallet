import {message} from 'antd'
import {useTranslation} from '../settings-state'

export const copyToClipboard = async (text: string): Promise<void> => {
  const {t} = useTranslation()

  await navigator.clipboard.writeText(text)

  message.success(t(['common', 'message', 'copiedToClipboard']))
}
