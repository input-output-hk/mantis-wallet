import React, {useState} from 'react'
import {Option, none, some, getOrElse, isNone} from 'fp-ts/lib/Option'
import {BorderlessInputPassword} from '../BorderlessInput'
import {DialogColumns} from './DialogColumns'
import './DialogPassword.scss'

interface DialogPasswordProps {
  onChange?: (value: string) => void
  setValid?: (valid: boolean) => void
  getValidationError?: (value: string) => Option<string>
  criteriaMessage?: string
}

export const DialogPassword: React.FunctionComponent<DialogPasswordProps> = ({
  onChange,
  setValid,
  getValidationError = (value: string): Option<string> =>
    value.length < 8 ? some('Password needs to have at least 8 characters') : none,
  criteriaMessage = 'Password needs to have at least 8 characters',
}: DialogPasswordProps) => {
  const [password, setPassword] = useState('')
  const [repassword, setRepassword] = useState('')

  const isValidAndMatch = (password: string, repassword: string): boolean =>
    isNone(getValidationError(password)) && password === repassword

  const errorMessage = getOrElse((): string =>
    password === repassword ? '' : "Passwords don't match",
  )(getValidationError(password))

  return (
    <div className="DialogPassword">
      <div className="label">Enter Password</div>
      <DialogColumns>
        <BorderlessInputPassword
          className="input"
          data-testid="password"
          forceInvalid={!!errorMessage}
          visibilityToggle={false}
          onChange={(e): void => {
            const newPassword = e.target.value
            setPassword(newPassword)
            if (onChange) {
              onChange(newPassword)
            }
            if (setValid) {
              setValid(isValidAndMatch(newPassword, repassword))
            }
          }}
        />
        <BorderlessInputPassword
          className="input"
          data-testid="rePassword"
          errorMessage={errorMessage}
          visibilityToggle={false}
          onChange={(e): void => {
            const newRepassword = e.target.value
            setRepassword(newRepassword)
            if (setValid) {
              setValid(isValidAndMatch(password, newRepassword))
            }
          }}
        />
      </DialogColumns>
      {criteriaMessage && <div className="criteria">{criteriaMessage}</div>}
    </div>
  )
}
