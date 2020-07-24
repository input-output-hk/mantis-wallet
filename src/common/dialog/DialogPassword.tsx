import React, {FunctionComponent} from 'react'
import {Form} from 'antd'
import {Rule} from 'antd/lib/form'
import {StoreValue} from 'antd/lib/form/interface'
import {useTranslation} from '../../settings-state'
import {BorderlessInputPassword} from '../BorderlessInput'
import {DialogState} from '../Dialog'
import {DialogColumns} from './DialogColumns'
import './DialogPassword.scss'

interface DialogPasswordProps {
  onChange?: (value: string) => void
  setValid?: (valid: boolean) => void
  rules?: Rule[]
  criteriaMessage?: string
}

export const hasAllNeededCharacters = {
  validator: (_rule: Rule, value: StoreValue): Promise<void> =>
    !/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/.test(value)
      ? Promise.reject(
          'Password needs to have at least 1 uppercase, 1 lowercase and 1 number character',
        )
      : Promise.resolve(),
}

const isAtLeast8Characters = {
  validator: (_rule: Rule, value: StoreValue): Promise<void> =>
    !value || value.length < 8
      ? Promise.reject('Password needs to be at least 8 characters')
      : Promise.resolve(),
}

const PASSWORD_FIELD = 'password'
const REPASSWORD_FIELD = 're-password'

export const DialogPassword: FunctionComponent<DialogPasswordProps> = ({
  onChange,
  rules = [hasAllNeededCharacters, isAtLeast8Characters],
  criteriaMessage = 'Note: Password needs to be at least 8\u00a0characters long and have at least 1\u00a0uppercase, 1\u00a0lowercase and 1\u00a0number',
}: DialogPasswordProps) => {
  const {dialogForm} = DialogState.useContainer()
  const {t} = useTranslation()

  return (
    <div className="DialogPassword">
      <div className="label">Enter Password</div>
      <DialogColumns>
        <Form.Item name={PASSWORD_FIELD} rules={rules} validateFirst className="password-form-item">
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
                      ? Promise.reject(t(['common', 'validationError', 'passwordsDoNotMatch']))
                      : Promise.resolve(),
                  ),
            }),
          ]}
        >
          <BorderlessInputPassword className="input" data-testid="rePassword" />
        </Form.Item>
      </DialogColumns>
      {criteriaMessage && <div className="criteria">{criteriaMessage}</div>}
    </div>
  )
}
