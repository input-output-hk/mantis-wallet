import {CopyOutlined, EditOutlined} from '@ant-design/icons'
import {Input, Popover} from 'antd'
import React, {useEffect, useState} from 'react'
import {useLocalizedUtilities, useTranslation} from '../settings-state'
import {LoadedState} from '../common/wallet-state'
import {withStatusGuard, PropsWithWalletState} from '../common/wallet-status-guard'
import './Address.scss'

interface AddressProps {
  address: string
}

const _Address = ({
  address,
  walletState: {addressBook, editContact},
}: PropsWithWalletState<AddressProps, LoadedState>): JSX.Element => {
  const {t} = useTranslation()
  const {copyToClipboard} = useLocalizedUtilities()

  const [isEditing, setEditing] = useState(false)
  const [inputContent, setInputContent] = useState('')
  const lowerAddress = address.toLowerCase()

  useEffect(() => setInputContent(''), [isEditing])

  if (isEditing) {
    const finishEditing = (): void => {
      if (inputContent) {
        editContact(lowerAddress, inputContent)
      }
      setEditing(false)
    }

    return (
      <Input
        size="small"
        placeholder={t(['addressBook', 'address', 'enterLabel'])}
        prefix={<EditOutlined />}
        value={inputContent}
        onChange={(event) => setInputContent(event.target.value)}
        onBlur={() => finishEditing()}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            finishEditing()
          }
        }}
        className="AddressEditor"
        autoFocus
      />
    )
  }

  const copyButton = (
    <Popover content={t(['addressBook', 'address', 'clickToCopy'])} placement="top">
      <CopyOutlined className="clickable" onClick={() => copyToClipboard(lowerAddress)} />
    </Popover>
  )

  if (lowerAddress in addressBook) {
    return (
      <span className="Address">
        <Popover content={lowerAddress}>
          <span>{addressBook[lowerAddress]}</span>
        </Popover>{' '}
        <EditOutlined onClick={() => setEditing(true)} /> {copyButton}
      </span>
    )
  }

  return (
    <span className="Address">
      {lowerAddress} <EditOutlined onClick={() => setEditing(true)} /> {copyButton}
    </span>
  )
}

export const Address = withStatusGuard(_Address, 'LOADED')
