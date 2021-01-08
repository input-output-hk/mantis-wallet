/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, {useState, useRef, useEffect, FunctionComponent} from 'react'
import classnames from 'classnames'
import {Input, Select} from 'antd'
import {SelectValue} from 'antd/lib/select'
import {DialogInput} from './DialogInput'
import {DialogSeedPhrase} from './DialogSeedPhrase'
import {fillActionHandlers, toAntValidator, validateEthPrivateKey} from '../util'
import {useTranslation} from '../store/settings'
import {TKeyRenderer} from '../i18n'
import {Trans} from '../Trans'
import './DialogSecrets.scss'

const recoveryMethods = ['privateKey', 'seedPhrase'] as const
export type RecoveryMethod = typeof recoveryMethods[number]

const recoveryMethodLabel: Record<RecoveryMethod, TKeyRenderer> = {
  privateKey: ['wallet', 'label', 'privateKey'],
  seedPhrase: ['wallet', 'label', 'recoveryPhrase'],
}

interface DialogSecrets {
  onMethodChange: (method: RecoveryMethod) => void
  onPrivateKeyChange: (privateKey: string) => void
  onSeedPhraseChange: (seedPhrase: string) => void
}

export const DialogSecrets: FunctionComponent<DialogSecrets> = ({
  onMethodChange,
  onPrivateKeyChange,
  onSeedPhraseChange,
}: DialogSecrets) => {
  const {t} = useTranslation()
  const [privateKey, setPrivateKey] = useState('')
  const [seedPhrase, setSeedPhrase] = useState('')
  const [recoveryMethod, setRecoveryMethod] = useState<RecoveryMethod>('privateKey')

  const privateKeyValidator = toAntValidator(t, validateEthPrivateKey)

  const isInitialMount = useRef(true)
  const inputRefs = {
    privateKey: useRef<Input>(null),
    seedPhrase: useRef<Select<SelectValue>>(null),
  }

  useEffect(() => {
    if (isInitialMount.current) {
      // eslint-disable-next-line
      isInitialMount.current = false
    } else {
      const inputRef = inputRefs[recoveryMethod]
      if (inputRef.current) inputRef.current.focus()
    }
  }, [recoveryMethod])

  const handleMethodChange = (method: RecoveryMethod) => () => {
    onMethodChange(method)
    setRecoveryMethod(method)
  }

  return (
    <div className="DialogSecrets">
      <div className="tabs">
        {recoveryMethods.map((method) => (
          <div
            key={method}
            className={classnames('tab', {active: method === recoveryMethod})}
            {...fillActionHandlers(handleMethodChange(method))}
          >
            <Trans k={recoveryMethodLabel[method]} />
          </div>
        ))}
      </div>
      {recoveryMethod === 'privateKey' ? (
        <div
          onKeyDown={(e) => {
            if (e.key === 'Tab' && !e.shiftKey && privateKey.length === 0) {
              e.preventDefault()
              handleMethodChange('seedPhrase')()
            }
          }}
        >
          <DialogInput
            data-testid="private-key"
            onChange={(e) => {
              const privateKey = e.target.value
              setPrivateKey(privateKey)
              onPrivateKeyChange(privateKey)
            }}
            ref={inputRefs.privateKey}
            formItem={{
              name: 'private-key',
              rules: [privateKeyValidator],
            }}
          />
        </div>
      ) : (
        <div
          onKeyDown={(e) => {
            if (e.key === 'Tab' && e.shiftKey && seedPhrase.length === 0) {
              e.preventDefault()
              handleMethodChange('privateKey')()
            }
          }}
        >
          <DialogSeedPhrase
            onChange={(seedPhrase) => {
              setSeedPhrase(seedPhrase)
              onSeedPhraseChange(seedPhrase)
            }}
            ref={inputRefs.seedPhrase}
          />
        </div>
      )}
    </div>
  )
}
