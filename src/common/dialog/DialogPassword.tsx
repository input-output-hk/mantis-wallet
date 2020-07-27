import React, {FunctionComponent} from 'react'
import {Form} from 'antd'
import {useTranslation} from '../../settings-state'
import {BorderlessInputPassword} from '../BorderlessInput'
import {DialogState} from '../Dialog'
import {DialogColumns} from './DialogColumns'
import {Trans} from '../Trans'
import {ValidationResult, toAntValidator} from '../util'
import './DialogPassword.scss'

interface DialogPasswordProps {
  onChange?: (value: string) => void
  setValid?: (valid: boolean) => void
}

export const hasAllNeededCharacters = (value?: string): ValidationResult => {
  return /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/.test(value || '')
    ? 'OK'
    : {tKey: ['wallet', 'error', 'missingCharacterTypeForPassword']}
}

const isAtLeast8Characters = (value?: string): ValidationResult =>
  !value || value.length < 8
    ? {tKey: ['wallet', 'error', 'passwordMustBeAtLeast8Characters']}
    : 'OK'

const PASSWORD_FIELD = 'password'
const REPASSWORD_FIELD = 're-password'

export const DialogPassword: FunctionComponent<DialogPasswordProps> = ({
  onChange,
}: DialogPasswordProps) => {
  const {dialogForm} = DialogState.useContainer()
  const {t} = useTranslation()

  return (
    <div className="DialogPassword">
      <div className="label">
        <Trans k={['wallet', 'label', 'enterPassword']} />
      </div>
      <DialogColumns>
        <Form.Item
          name={PASSWORD_FIELD}
          rules={[
            toAntValidator(t, hasAllNeededCharacters),
            toAntValidator(t, isAtLeast8Characters),
          ]}
          validateFirst
          className="password-form-item"
        >
          <BorderlessInputPassword
            className="input"
            data-testid="password"
            onChange={(e) => {
              onChange?.(e.target.value)
              dialogForm.validateFields([REPASSWORD_FIELD])
            }}
          />
        </Form.Item>
        <Form.Item
          name={REPASSWORD_FIELD}
          dependencies={[PASSWORD_FIELD]}
          rules={[
            ({getFieldValue, validateFields, getFieldError}) => ({
              validator: (_rule, value) =>
                validateFields([PASSWORD_FIELD])
                  .catch(() =>
                    getFieldError(PASSWORD_FIELD)[0]
                      ? Promise.reject(getFieldError(PASSWORD_FIELD)[0])
                      : Promise.resolve(),
                  )
                  .then(() =>
                    !value || getFieldValue(PASSWORD_FIELD) !== value
                      ? Promise.reject(t(['common', 'error', 'passwordsDoNotMatch']))
                      : Promise.resolve(),
                  ),
            }),
          ]}
        >
          <BorderlessInputPassword className="input" data-testid="rePassword" />
        </Form.Item>
      </DialogColumns>
      <div className="criteria">
        <Trans k={['wallet', 'message', 'passwordCriteriaMessage']} />
      </div>
    </div>
  )
}
