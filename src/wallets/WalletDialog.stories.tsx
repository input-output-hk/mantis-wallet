import React from 'react'
import _ from 'lodash/fp'
import {withKnobs, text, boolean, array} from '@storybook/addon-knobs'
import {action} from '@storybook/addon-actions'
import {WalletDialog} from './WalletDialog'
import {WalletDialogApproval} from './dialog/WalletDialogApproval'
import {WalletDialogInput} from './dialog/WalletDialogInput'
import {WalletDialogMessage} from './dialog/WalletDialogMessage'
import {WalletDialogPassword} from './dialog/WalletDialogPassword'
import {WalletDialogPrivateKey} from './dialog/WalletDialogPrivateKey'
import {WalletDialogRecoveryPhrase} from './dialog/WalletDialogRecoveryPhrase'
import {WalletDialogSecurity} from './dialog/WalletDialogSecurity'
import {WalletDialogSwitch} from './dialog/WalletDialogSwitch'
import {useState} from '@storybook/addons'

export default {
  title: 'Wallet Dialog',
  decorators: [withKnobs],
}

export const AllTheFields: React.FunctionComponent<{}> = () => {
  const [approved, setApproved] = useState(false)
  const [switched, setSwitched] = useState(false)

  return (
    <WalletDialog
      title="All The Fields"
      prevButtonLabel={text('Cancel button label', 'Cancel')}
      prevButtonAction={action('prev-button-click')}
      nextButtonLabel={text('Next button label', 'Next →')}
      nextButtonAction={action('next-button-click')}
      nextButtonDisabled={boolean('Disable Next button', true)}
    >
      <WalletDialogApproval
        description={text('Approval field text', 'Are you sure?')}
        checked={approved}
        onChange={(checked): void => {
          setApproved(checked)
          alert(checked ? 'Is approved' : 'Is not approved')
        }}
      />
      <WalletDialogInput label={text('Input field label', 'write your input here')} />
      <WalletDialogMessage description={text('Message field text', 'A message in the dialog')} />
      <WalletDialogPassword />
      <WalletDialogPrivateKey
        privateKey={text('Private key field', 'ThisIsYourVeryVeryVeryVeryLongPrivateKey')}
      />
      <WalletDialogRecoveryPhrase
        recoveryPhraseShuffled={['Third', 'First', 'Fourth', 'Second']}
        recoveryPhraseValidation={(enteredPhrase): boolean =>
          _.isEqual(enteredPhrase, ['First', 'Second', 'Third', 'Fourth'])
        }
        setRecoveryPhraseValidated={(valid): void => {
          if (valid) action('recovery-phrase-valid')()
        }}
      />
      <WalletDialogSecurity
        labels={array('Security Dialog', ['First security', 'Second security'])}
      />
      <WalletDialogSwitch
        label={text('Switch field label', 'Switch this')}
        description={text('Switch field text', '..becuase of this')}
        onChange={(checked): void => setSwitched(checked)}
        checked={switched}
      />
    </WalletDialog>
  )
}
