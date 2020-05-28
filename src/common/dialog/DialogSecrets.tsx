import React, {useState, useRef, useEffect} from 'react'
import classnames from 'classnames'
import {Input, Select} from 'antd'
import {SelectValue} from 'antd/lib/select'
import {DialogInput} from './DialogInput'
import {DialogSeedPhrase} from './DialogSeedPhrase'
import './DialogSecrets.scss'

export enum RecoveryMethod {
  SpendingKey = 'Private Key',
  SeedPhrase = 'Recovery Phrase',
}

interface DialogSecrets {
  onMethodChange: (method: RecoveryMethod) => void
  onSpendingKeyChange: (spendinKey: string) => void
  onSeedPhraseChange: (seedPhrase: string) => void
}

export const DialogSecrets: React.FunctionComponent<DialogSecrets> = ({
  onMethodChange,
  onSpendingKeyChange,
  onSeedPhraseChange,
}: DialogSecrets) => {
  const [spendingKey, setSpendingKey] = useState('')
  const [seedPhrase, setSeedPhrase] = useState('')
  const [recoveryMethod, setRecoveryMethod] = useState(RecoveryMethod.SpendingKey)
  const isInitialMount = useRef(true)
  const inputRefs = {
    [RecoveryMethod.SpendingKey]: useRef<Input>(null),
    [RecoveryMethod.SeedPhrase]: useRef<Select<SelectValue>>(null),
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
        {Object.values(RecoveryMethod).map((method) => (
          <div
            key={method}
            className={classnames('tab', {active: method === recoveryMethod})}
            onClick={handleMethodChange(method)}
          >
            {method}
          </div>
        ))}
      </div>
      <div
        className={classnames({hidden: RecoveryMethod.SpendingKey !== recoveryMethod})}
        onKeyDown={(e) => {
          if (e.key === 'Tab' && !e.shiftKey && spendingKey.length === 0) {
            e.preventDefault()
            handleMethodChange(RecoveryMethod.SeedPhrase)()
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
          ref={inputRefs[RecoveryMethod.SpendingKey]}
        />
      </div>
      <div
        className={classnames({hidden: RecoveryMethod.SeedPhrase !== recoveryMethod})}
        onKeyDown={(e) => {
          if (e.key === 'Tab' && e.shiftKey && seedPhrase.length === 0) {
            e.preventDefault()
            handleMethodChange(RecoveryMethod.SpendingKey)()
          }
        }}
      >
        <DialogSeedPhrase
          onChange={(seedPhrase) => {
            setSeedPhrase(seedPhrase)
            onSeedPhraseChange(seedPhrase)
          }}
          ref={inputRefs[RecoveryMethod.SeedPhrase]}
        />
      </div>
    </div>
  )
}
