import React, {useState} from 'react'
import _ from 'lodash/fp'
import {Option, none, some} from 'fp-ts/lib/Option'
import {withKnobs, text, boolean, array} from '@storybook/addon-knobs'
import {action} from '@storybook/addon-actions'
import {Dialog} from './Dialog'
import {DialogApproval} from './dialog/DialogApproval'
import {DialogInput} from './dialog/DialogInput'
import {DialogMessage} from './dialog/DialogMessage'
import {DialogPassword} from './dialog/DialogPassword'
import {DialogPrivateKey} from './dialog/DialogPrivateKey'
import {DialogRecoveryPhrase} from './dialog/DialogRecoveryPhrase'
import {DialogTabs} from './dialog/DialogTabs'
import {DialogSwitch} from './dialog/DialogSwitch'
import {DialogDropdown} from './dialog/DialogDropdown'
import {DialogColumns} from './dialog/DialogColumns'
import {DialogError} from './dialog/DialogError'
import {DialogDisplayWords} from './dialog/DialogDisplayWords'

export default {
  title: 'Dialog',
  decorators: [withKnobs],
}

export const InteractiveDialog: React.FunctionComponent<{}> = () => (
  <Dialog
    title={text('Dialog title', 'Dialog title')}
    prevButtonProps={{
      children: text('Cancel button label', 'Cancel'),
      onClick: action('prev-button-click'),
      disabled: boolean('Disable Prev button', false),
    }}
    nextButtonProps={{
      children: text('Next button label', 'Next'),
      onClick: action('next-button-click'),
      disabled: boolean('Disable Next button', true),
    }}
    footer={text('Footer', 'footer text')}
  >
    {text('Dialog content', 'Dialog content')}
  </Dialog>
)

export const InteractiveApproval: React.FunctionComponent<{}> = () => {
  const [approved, setApproved] = useState(false)

  return (
    <Dialog title="Dialog Approval">
      <DialogApproval
        description={text('Approval field text', 'Are you sure?')}
        checked={approved}
        onChange={(checked): void => {
          setApproved(checked)
          action(checked ? 'Is approved' : 'Is not approved')()
        }}
      />
    </Dialog>
  )
}

export const InteractiveColumns: React.FunctionComponent<{}> = () => (
  <Dialog title="Dialog Columns">
    <DialogColumns>
      <DialogMessage description={text('First column', 'First column')} />
      <DialogMessage description={text('Second column', 'Second column')} />
    </DialogColumns>
  </Dialog>
)

export const InteractiveDisplayWords: React.FunctionComponent<{}> = () => (
  <Dialog title="Dialog Display Words">
    <DialogDisplayWords words={array('Displayed words', ['First', 'Second', 'Third', 'Fourth'])} />
  </Dialog>
)

export const InteractiveDropdown: React.FunctionComponent<{}> = () => (
  <Dialog title="Dialog Dropdown">
    <DialogDropdown
      label={text('Dropdown label', 'Hover me')}
      options={array('Dropdown options', ['first', 'second', 'third'])}
    />
  </Dialog>
)

export const InteractiveError: React.FunctionComponent<{}> = () => (
  <Dialog
    title="Dialog Error"
    footer={<DialogError>{text('Error in footer', 'Error in the footer')}</DialogError>}
  >
    <DialogError>{text('Error in content', 'Error in the dialog')}</DialogError>
  </Dialog>
)

export const InteractiveInput: React.FunctionComponent<{}> = () => (
  <Dialog title="Dialog Input">
    <DialogInput label={text('Input label', 'Input label')} />
  </Dialog>
)

export const InteractiveDarkInput: React.FunctionComponent<{}> = () => (
  <Dialog title="Dialog Input dark" type="dark">
    <DialogInput label={text('Input label', 'Input label')} />
  </Dialog>
)

export const InteractiveMessage: React.FunctionComponent<{}> = () => (
  <Dialog title="Dialog Message">
    <DialogMessage description={text('Message text', 'This is a message in a dialog')} />
  </Dialog>
)

export const InteractivePassword: React.FunctionComponent<{}> = () => (
  <Dialog title="Dialog Password">
    <DialogPassword
      criteriaMessage={text('Password criteria', 'Password should be at least 4 characters')}
      setValid={action('set-valid-password')}
      onChange={action('on-change-password')}
      getValidationError={(value: string): Option<string> => {
        return value.length < 4
          ? some(text('Inline error', 'Password should be at least 4 characters'))
          : none
      }}
    />
  </Dialog>
)

export const InteractivePrivateKey: React.FunctionComponent<{}> = () => (
  <Dialog title="Dialog Private Key">
    <DialogPrivateKey
      privateKey={text('Private key field', 'ThisIsYourVeryVeryVeryVeryLongPrivateKey')}
      enableDownload={boolean('Enable download', true)}
    />
  </Dialog>
)

export const InteractiveRecoveryPhrase: React.FunctionComponent<{}> = () => (
  <Dialog title="Dialog Recovery Phrase">
    <DialogRecoveryPhrase
      recoveryPhraseShuffled={['Third', 'First', 'Fourth', 'Second']}
      recoveryPhraseValidation={(enteredPhrase): boolean =>
        _.isEqual(enteredPhrase, ['First', 'Second', 'Third', 'Fourth'])
      }
      setRecoveryPhraseValidated={(valid): void => {
        if (valid) action('recovery-phrase-valid')()
      }}
    />
  </Dialog>
)

export const InteractiveSwitch: React.FunctionComponent<{}> = () => {
  const [switched, setSwitched] = useState(false)

  return (
    <Dialog title="Dialog Switch">
      <DialogSwitch
        label={text('Switch field label', 'Switch this')}
        description={text('Switch field text', '..becuase of this')}
        onChange={(checked): void => {
          setSwitched(checked)
          action(checked ? 'Is switched' : 'Is not switched')()
        }}
        checked={switched}
      />
    </Dialog>
  )
}

export const InteractiveTabs: React.FunctionComponent<{}> = () => (
  <Dialog title="Dialog Tabs">
    <DialogTabs
      tabs={[
        {
          label: text('First tab', 'First tab'),
          content: text('First tab content', 'First tab content'),
        },
        {
          label: text('Second tab', 'Second tab'),
          content: text('Second tab content', 'Second tab content'),
        },
      ]}
      onTabClick={action('on-tab-click')}
    />
  </Dialog>
)
