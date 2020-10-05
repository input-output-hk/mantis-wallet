import React, {useState} from 'react'
import _ from 'lodash/fp'
import {Rule} from 'antd/lib/form'
import {Select} from 'antd'
import {Trans} from '../Trans'
import {LoadedState} from '../wallet-state'
import {useTranslation} from '../../settings-state'
import {withStatusGuard, PropsWithWalletState} from '../wallet-status-guard'
import {DialogState} from '../Dialog'
import {DialogColumns} from './DialogColumns'
import {DialogInput} from './DialogInput'
import './DialogAddressSelect.scss'

const {Option} = Select

const RECIPIENT_FIELD = 'recipient-address'
const CONTACT_SELECT_FIELD = 'contact-select'

interface DialogAddressSelectProps {
  addressValidator: Rule
  recipient: string
  setRecipient: (recipient: string) => void
}

const _DialogAddressSelect = ({
  addressValidator,
  setRecipient,
  recipient,
  walletState: {addressLabels},
}: PropsWithWalletState<DialogAddressSelectProps, LoadedState>): JSX.Element => {
  const {dialogForm} = DialogState.useContainer()
  const {t} = useTranslation()

  const [selectedAddress, setSelectedAddress] = useState<string | undefined>(undefined)

  return (
    <div className="DialogAddressSelect">
      <DialogColumns>
        <DialogInput
          label={t(['wallet', 'label', 'recipient'])}
          id={RECIPIENT_FIELD}
          onChange={(e): void => {
            setRecipient(e.target.value)
            setSelectedAddress(undefined)
          }}
          value={recipient}
          formItem={{
            name: RECIPIENT_FIELD,
            rules: [
              {required: true, message: t(['wallet', 'error', 'recipientMustBe'])},
              addressValidator,
            ],
          }}
        />
        <div className="SelectContact">
          <label className="label" htmlFor={CONTACT_SELECT_FIELD}>
            <Trans k={['addressBook', 'addressSelect', 'selectContact']} />
          </label>
          <Select
            className="select-contact-field"
            placeholder="…"
            id={CONTACT_SELECT_FIELD}
            value={selectedAddress}
            onChange={(address: string): void => {
              setSelectedAddress(address)
              setRecipient(address)
              dialogForm.setFieldsValue({[RECIPIENT_FIELD]: address})
            }}
            notFoundContent={<Trans k={['addressBook', 'book', 'noData']} />}
            bordered={false}
          >
            {_.toPairs(addressLabels).map(([address, label]) => (
              <Option value={address} key={address}>
                {label}
              </Option>
            ))}
          </Select>
        </div>
      </DialogColumns>
    </div>
  )
}

export const DialogAddressSelect = withStatusGuard(_DialogAddressSelect, 'LOADED')
