import React, {useState} from 'react'
import _ from 'lodash/fp'
import {withKnobs, text, boolean, array} from '@storybook/addon-knobs'
import {action} from '@storybook/addon-actions'
import {Dialog} from './Dialog'
import {DialogApproval} from './dialog/DialogApproval'
import {DialogInput} from './dialog/DialogInput'
import {DialogMessage} from './dialog/DialogMessage'
import {DialogPassword} from './dialog/DialogPassword'
import {DialogPrivateKey} from './dialog/DialogPrivateKey'
import {DialogRecoveryPhrase} from './dialog/DialogRecoveryPhrase'
import {DialogTabbedInput} from './dialog/DialogTabbedInput'
import {DialogSwitch} from './dialog/DialogSwitch'
import {DialogDropdown} from './dialog/DialogDropdown'
import {DialogColumns} from './dialog/DialogColumns'

export default {
  title: 'Dialog',
  decorators: [withKnobs],
}

export const AllTheFields: React.FunctionComponent<{}> = () => {
  const [approved, setApproved] = useState(false)
  const [switched, setSwitched] = useState(false)

  return (
    <Dialog
      title="All The Fields"
      prevButtonProps={{
        children: text('Cancel button label', 'Cancel'),
        onClick: action('prev-button-click'),
      }}
      nextButtonProps={{
        children: text('Next button label', 'Next'),
        onClick: action('next-button-click'),
        disabled: boolean('Disable Next button', true),
      }}
    >
      <DialogApproval
        description={text('Approval field text', 'Are you sure?')}
        checked={approved}
        onChange={(checked): void => {
          setApproved(checked)
          alert(checked ? 'Is approved' : 'Is not approved')
        }}
      />
      <DialogInput label={text('Input field label', 'write your input here')} />
      <DialogMessage description={text('Message field text', 'A message in the dialog')} />
      <DialogPassword />
      <DialogPrivateKey
        privateKey={text('Private key field', 'ThisIsYourVeryVeryVeryVeryLongPrivateKey')}
      />
      <DialogRecoveryPhrase
        recoveryPhraseShuffled={['Third', 'First', 'Fourth', 'Second']}
        recoveryPhraseValidation={(enteredPhrase): boolean =>
          _.isEqual(enteredPhrase, ['First', 'Second', 'Third', 'Fourth'])
        }
        setRecoveryPhraseValidated={(valid): void => {
          if (valid) action('recovery-phrase-valid')()
        }}
      />
      <DialogTabbedInput labels={array('Security Dialog', ['First security', 'Second security'])} />
      <DialogSwitch
        label={text('Switch field label', 'Switch this')}
        description={text('Switch field text', '..becuase of this')}
        onChange={(checked): void => setSwitched(checked)}
        checked={switched}
      />
      <DialogDropdown
        label={text('Dropdown label', 'Hover me')}
        options={array('Dropdown options', ['first', 'second', 'third'])}
      ></DialogDropdown>
      <DialogColumns>
        <DialogMessage description={text('First column', 'First column')} />
        <DialogMessage description={text('Second column', 'Second column')} />
      </DialogColumns>
    </Dialog>
  )
}
