import React, {useState} from 'react'
import {Option, none, some, getOrElse, isNone, getFirstMonoid} from 'fp-ts/lib/Option'
import {BorderlessInputPassword} from '../BorderlessInput'
import {DialogColumns} from './DialogColumns'
import './DialogPassword.scss'
import {InlineError} from '../InlineError'

interface DialogPasswordProps {
  onChange?: (value: string) => void
  setValid?: (valid: boolean) => void
  getValidationError?: (value: string) => Option<string>
  criteriaMessage?: string
}

export const hasAllNeededCharacters = (value: string): Option<string> =>
  !/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/.test(value)
    ? some('Password needs to have at least 1 uppercase, 1 lowercase and 1 number character')
    : none

const isAtleast8Characeters = (value: string): Option<string> =>
  value.length < 8 ? some('Password needs to be at least 8 characters') : none

export const DialogPassword: React.FunctionComponent<DialogPasswordProps> = ({
  onChange,
  setValid,
  getValidationError = (value: string): Option<string> =>
    getFirstMonoid<string>().concat(hasAllNeededCharacters(value), isAtleast8Characeters(value)),
  criteriaMessage = 'Note: Password needs to be at least 8\u00a0characters long and have at least 1\u00a0uppercase, 1\u00a0lowercase and 1\u00a0number',
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
      <InlineError errorMessage={errorMessage}>
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
            forceInvalid={!!errorMessage}
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
      </InlineError>
      {criteriaMessage && <div className="criteria">{criteriaMessage}</div>}
    </div>
  )
}
