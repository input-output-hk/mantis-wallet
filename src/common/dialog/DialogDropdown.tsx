import React, {useState} from 'react'
import _ from 'lodash/fp'
import classnames from 'classnames'
import {Dropdown, Menu} from 'antd'
import {DialogError} from './DialogError'
import './DialogDropdown.scss'

interface DialogDropdownOption<T> {
  key: T
  label: React.ReactNode
}

interface DialogDropdownProps<T> {
  label: string
  options: ReadonlyArray<T | DialogDropdownOption<T>>
  defaultOptionIndex?: number
  onChange?: (option: T) => void
  noOptionsMessage?: string
}

export const DialogDropdown = <T extends string>({
  label,
  options,
  defaultOptionIndex = 0,
  onChange,
  noOptionsMessage = 'No available options',
}: DialogDropdownProps<T>): JSX.Element => {
  const trueOptions: Array<DialogDropdownOption<T>> = options.map((option) =>
    _.isString(option) ? {key: option, label: option} : option,
  )
  const [activeOption, setActiveOption] = useState(trueOptions[defaultOptionIndex])

  const handleClick = (option: DialogDropdownOption<T>) => () => {
    setActiveOption(option)
    if (onChange) onChange(option.key)
  }

  const menu = (
    <Menu>
      {trueOptions.map(({key, label}) => (
        <Menu.Item key={key} onClick={handleClick({key, label})}>
          {label}
        </Menu.Item>
      ))}
    </Menu>
  )

  return (
    <div className="DialogDropdown">
      <Dropdown overlay={menu} overlayClassName="DialogDropdownOverlay">
        <span className="label">{label} ▼</span>
      </Dropdown>
      {trueOptions.length > 0 && activeOption && (
        <div className="active-option">{activeOption.label}</div>
      )}
      {trueOptions.length > 0 && !activeOption && (
        <div className="active-option no-option">Choose from list...</div>
      )}
      {trueOptions.length === 0 && <DialogError>{noOptionsMessage}</DialogError>}
    </div>
  )
}
