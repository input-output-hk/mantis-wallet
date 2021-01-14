import {Input, Popover} from 'antd'
import React, {useEffect, useState} from 'react'
import {useLocalizedUtilities, useTranslation} from '../settings-state'
import {LoadedState} from '../common/wallet-state'
import {withStatusGuard, PropsWithWalletState} from '../common/wallet-status-guard'
import './Address.scss'
import {IconButton} from '../common/IconButton'

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
      <IconButton
        icon="copy"
        title="Copy"
        width={12}
        height={12}
        onClick={() => copyToClipboard(address)}
      />
    </Popover>
  )

  if (lowerAddress in addressBook) {
    return (
      <span className="Address">
        <Popover content={lowerAddress}>
          <span>{addressBook[lowerAddress]}</span>
        </Popover>{' '}
        <IconButton
          icon="edit"
          title="Edit"
          onClick={() => setEditing(true)}
          width={12}
          height={12}
        />{' '}
        {copyButton}
      </span>
    )
  }

  return (
    <span className="Address">
      {lowerAddress}{' '}
      <IconButton
        icon="edit"
        title="Edit"
        width={12}
        height={12}
        onClick={() => setEditing(true)}
      />{' '}
      {copyButton}
    </span>
  )
}

export const Address = withStatusGuard(_Address, 'LOADED')
