import React from 'react'
import {ESSENTIAL_DECORATORS} from '../storybook-util/essential-decorators'
import {Address} from './Address'
import {AddressBook} from './AddressBook'

export default {
  title: 'Address Book',
  decorators: ESSENTIAL_DECORATORS,
}

export const addressBook = (): JSX.Element => <AddressBook />

export const editableAddress = (): JSX.Element => (
  <Address address="0x3b20f0bcc64671d8d758f3469ec5ce4c8484a871" />
)
