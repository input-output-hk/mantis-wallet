/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, {useState, useRef, useEffect, FunctionComponent} from 'react'
import classnames from 'classnames'
import {Input, Select} from 'antd'
import {SelectValue} from 'antd/lib/select'
import {DialogInput} from './DialogInput'
import {DialogSeedPhrase} from './DialogSeedPhrase'
import {fillActionHandlers, toAntValidator, validateEthPrivateKey} from '../util'
import {useTranslation} from '../../settings-state'
import {TKeyRenderer} from '../i18n'
import {Trans} from '../Trans'
import './DialogSecrets.scss'

const recoveryMethods = ['spendingKey', 'seedPhrase'] as const
export type RecoveryMethod = typeof recoveryMethods[number]

const recoveryMethodLabel: Record<RecoveryMethod, TKeyRenderer> = {
  spendingKey: ['wallet', 'label', 'privateKey'],
  seedPhrase: ['wallet', 'label', 'recoveryPhrase'],
}

interface DialogSecrets {
  onMethodChange: (method: RecoveryMethod) => void
  onSpendingKeyChange: (spendingKey: string) => void
  onSeedPhraseChange: (seedPhrase: string) => void
}

export const DialogSecrets: FunctionComponent<DialogSecrets> = ({
  onMethodChange,
  onSpendingKeyChange,
  onSeedPhraseChange,
}: DialogSecrets) => {
  const {t} = useTranslation()
  const [spendingKey, setSpendingKey] = useState('')
  const [seedPhrase, setSeedPhrase] = useState('')
  const [recoveryMethod, setRecoveryMethod] = useState<RecoveryMethod>('spendingKey')

  const privateKeyValidator = toAntValidator(t, validateEthPrivateKey)

  const isInitialMount = useRef(true)
  const inputRefs = {
    spendingKey: useRef<Input>(null),
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
      <div
        className={classnames({hidden: 'spendingKey' !== recoveryMethod})}
        onKeyDown={(e) => {
          if (e.key === 'Tab' && !e.shiftKey && spendingKey.length === 0) {
            e.preventDefault()
            handleMethodChange('seedPhrase')()
          }
        }}
      >
        <DialogInput
          data-testid="private-key"
          onChange={(e) => {
            const spendingKey = e.target.value
            setSpendingKey(spendingKey)
            onSpendingKeyChange(spendingKey)
          }}
          ref={inputRefs.spendingKey}
          formItem={{
            name: 'private-key',
            rules: [privateKeyValidator],
          }}
        />
      </div>
      <div
        className={classnames({hidden: 'seedPhrase' !== recoveryMethod})}
        onKeyDown={(e) => {
          if (e.key === 'Tab' && e.shiftKey && seedPhrase.length === 0) {
            e.preventDefault()
            handleMethodChange('spendingKey')()
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
    </div>
  )
}
