import React, {useState, FunctionComponent} from 'react'
import _ from 'lodash/fp'
import {text, boolean, array, select} from '@storybook/addon-knobs'
import {action} from '@storybook/addon-actions'
import {ESSENTIAL_DECORATORS} from '../storybook-util/essential-decorators'
import {Dialog} from './Dialog'
import {DialogApproval} from './dialog/DialogApproval'
import {DialogInput} from './dialog/DialogInput'
import {DialogMessage} from './dialog/DialogMessage'
import {DialogPassword} from './dialog/DialogPassword'
import {DialogQRCode} from './dialog/DialogQRCode'
import {DialogRecoveryPhrase} from './dialog/DialogRecoveryPhrase'
import {DialogSwitch} from './dialog/DialogSwitch'
import {DialogDropdown} from './dialog/DialogDropdown'
import {DialogColumns} from './dialog/DialogColumns'
import {DialogError} from './dialog/DialogError'
import {DialogDisplayWords} from './dialog/DialogDisplayWords'
import {DialogSeedPhrase} from './dialog/DialogSeedPhrase'
import {DialogSecrets} from './dialog/DialogSecrets'
import {ether} from '../storybook-util/custom-knobs'
import {DialogShowAmount} from './dialog/DialogShowAmount'
import {DialogTextSwitch} from './dialog/DialogTextSwitch'
import {DialogFee} from './dialog/DialogFee'

export default {
  title: 'Dialog',
  decorators: ESSENTIAL_DECORATORS,
}

export const InteractiveDialog: FunctionComponent<{}> = () => (
  <Dialog
    title={text('Dialog title', 'Dialog title')}
    buttonDisplayMode={select('Button display mode', ['natural', 'grid', 'wide'], 'grid')}
    leftButtonProps={{
      children: text('Left button label', 'Cancel'),
      onClick: action('left-button-click'),
      disabled: boolean('Disable Left button', false),
      doNotRender: boolean('Do not render Left button', false),
    }}
    rightButtonProps={{
      children: text('Right button label', 'Next'),
      onClick: action('right-button-click'),
      disabled: boolean('Disable Right button', true),
      doNotRender: boolean('Do not render Right button', false),
    }}
    footer={text('Footer', 'footer text')}
  >
    {text('Dialog content', 'Dialog content')}
  </Dialog>
)

export const InteractiveApproval: FunctionComponent<{}> = () => {
  const [approved, setApproved] = useState(false)

  return (
    <Dialog title="Dialog Approval" type={select('Input type', ['normal', 'dark'], 'normal')}>
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

export const InteractiveColumns: FunctionComponent<{}> = () => (
  <Dialog title="Dialog Columns">
    <DialogColumns>
      <DialogMessage>{text('First column', 'First column')}</DialogMessage>
      <DialogMessage>{text('Second column', 'Second column')}</DialogMessage>
    </DialogColumns>
  </Dialog>
)

export const InteractiveDisplayWords: FunctionComponent<{}> = () => (
  <Dialog title="Dialog Display Words">
    <DialogDisplayWords
      words={array('Displayed words', [
        // max length words with "m"
        'champion',
        'cinnamon',
        'december',
        'document',
        'mechanic',
        'midnight',
        'mosquito',
        'mountain',
        'mushroom',
        'remember',
        'resemble',
        'tomorrow',
      ])}
    />
  </Dialog>
)

export const InteractiveDropdown: FunctionComponent<{}> = () => (
  <Dialog title="Dialog Dropdown">
    <DialogDropdown
      label={text('Dropdown label', 'Hover me')}
      options={[
        {
          key: text('First key', 'First key'),
          label: text('First label', 'First label'),
        },
        {
          key: text('Second key', 'Second key'),
          label: text('Second label', 'Second label'),
        },
        text('Simple string option', 'Simple string option'),
      ]}
      onChange={action('on-change')}
    />
  </Dialog>
)

export const InteractiveError: FunctionComponent<{}> = () => (
  <Dialog
    title="Dialog Error"
    footer={<DialogError>{text('Error in footer', 'Error in the footer')}</DialogError>}
  >
    <DialogError>{text('Error in content', 'Error in the dialog')}</DialogError>
  </Dialog>
)

export const InteractiveFee: FunctionComponent<{}> = () => (
  <Dialog title="Dialog Fee" type={select('Input fee', ['normal', 'dark'], 'normal')}>
    <DialogFee
      label={text('Fee label', 'Fee label')}
      feeEstimates={{
        low: ether('Fee low estimate', 0.01),
        medium: ether('Fee medium estimate', 0.02),
        high: ether('Fee high estimate', 0.03),
      }}
      onChange={action('on-change')}
      errorMessage={text('Error message', '')}
    />
  </Dialog>
)

export const InteractiveInput: FunctionComponent<{}> = () => (
  <Dialog title="Dialog Input" type={select('Input type', ['normal', 'dark'], 'normal')}>
    <DialogInput label={text('Input label', 'Input label')} />
  </Dialog>
)

export const InteractiveMessage: FunctionComponent<{}> = () => (
  <Dialog title="Dialog Message">
    <DialogMessage type={select('Input type', ['default', 'highlight'], 'default')}>
      {text('Message text', 'This is a message in a dialog')}
    </DialogMessage>
  </Dialog>
)

export const InteractivePassword: FunctionComponent<{}> = () => (
  <Dialog title="Dialog Password">
    <DialogPassword
      setValid={action('set-valid-password')}
      onChange={action('on-change-password')}
    />
  </Dialog>
)

export const InteractiveRestoreSeedPhrase: FunctionComponent<{}> = () => (
  <Dialog title="Dialog Restore Seed Phrase">
    <DialogSeedPhrase onChange={action('onChange')} />
  </Dialog>
)

export const InteractivePrivateKey: FunctionComponent<{}> = () => (
  <Dialog title="Dialog Private Key">
    <DialogQRCode
      content={text('Private key field', 'ThisIsYourVeryVeryVeryVeryLongPrivateKey')}
      downloadFileName={text('Download file name', 'your-private-key')}
      blurred={boolean('Blurred', false)}
    />
  </Dialog>
)

export const InteractiveRecoveryPhrase: FunctionComponent<{}> = () => (
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

export const InteractiveSecrets: FunctionComponent<{}> = () => {
  return (
    <Dialog title="Dialog Secrets">
      <DialogSecrets
        onMethodChange={action('on-method-change')}
        onPrivateKeyChange={action('on-private-key-change')}
        onSeedPhraseChange={action('on-seed-phrase-change')}
      />
    </Dialog>
  )
}

export const InteractiveShowAmount: FunctionComponent<{}> = () => {
  return (
    <Dialog title="Dialog Secrets">
      <DialogShowAmount amount={ether('ETC amount', 123.456)}>
        {text('Show Amount label', 'ETC amount')}
      </DialogShowAmount>
    </Dialog>
  )
}

export const InteractiveSwitch: FunctionComponent<{}> = () => {
  const [switched, setSwitched] = useState(false)

  return (
    <Dialog title="Dialog Switch">
      <DialogSwitch
        label={text('Switch field label', 'Switch this')}
        description={text('Switch field text', '..because of this')}
        onChange={(checked): void => {
          setSwitched(checked)
          action(checked ? 'Is switched' : 'Is not switched')()
        }}
        checked={switched}
      />
    </Dialog>
  )
}

export const InteractiveTextSwitch: FunctionComponent<{}> = () => {
  return (
    <Dialog title="Dialog Text Switch">
      <DialogTextSwitch
        label={text('Switch label', 'Label')}
        left={{label: text('Left label', 'Left'), type: 'left'}}
        right={{label: text('Right label', 'Right'), type: 'right'}}
        disabled={boolean('Is disabled', false)}
        onChange={action('on-change')}
      />
    </Dialog>
  )
}
