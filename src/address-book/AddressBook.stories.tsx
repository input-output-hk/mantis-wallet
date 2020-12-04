import React from 'react'
import {action} from '@storybook/addon-actions'
import {select, text} from '@storybook/addon-knobs'
import {ESSENTIAL_DECORATORS} from '../storybook-util/essential-decorators'
import {address1} from '../storybook-util/dummies'
import {Address} from './Address'
import {AddressBook, DeleteContactModal, EditContactModal} from './AddressBook'

address1

export default {
  title: 'Address book',
  decorators: ESSENTIAL_DECORATORS,
}

export const addressBook = (): JSX.Element => <AddressBook />

export const editableAddress = (): JSX.Element => <Address address={address1} />

export const editContact = (): JSX.Element => (
  <EditContactModal
    onCancel={action('on-cancel')}
    onSave={action('on-save')}
    address={address1}
    label={text('Label', 'Mice Pápai')}
    setAddress={action('set-address')}
    setLabel={action('set-label')}
    editMode={select('Mode', ['Add', 'Edit'], 'Add')}
    visible
  />
)

export const deleteContact = (): JSX.Element => (
  <DeleteContactModal
    onCancel={action('on-cancel')}
    onDelete={action('on-delete')}
    address={text('Address', address1)}
    label={text('Label', 'Mice Pápai')}
    visible
  />
)
