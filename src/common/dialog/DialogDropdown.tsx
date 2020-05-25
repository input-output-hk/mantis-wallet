import React, {useState} from 'react'
import _ from 'lodash/fp'
import classnames from 'classnames'
import {Dropdown, Menu} from 'antd'
import './DialogDropdown.scss'

interface DialogDropdownOption<T> {
  key: T
  label: React.ReactNode
}

interface DialogDropdownProps<T> {
  type?: 'normal' | 'small'
  label: string
  options: Array<DialogDropdownOption<T> | T>
  onChange?: (option: T) => void
}

export const DialogDropdown = <T extends string>({
  type = 'normal',
  label,
  options,
  onChange,
}: DialogDropdownProps<T>): JSX.Element => {
  const trueOptions: Array<DialogDropdownOption<T>> = options.map((option) =>
    _.isString(option) ? {key: option, label: option} : option,
  )
  const [activeOption, setActiveOption] = useState(trueOptions[0])

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
    <div className={classnames('DialogDropdown', type)}>
      <Dropdown overlay={menu} overlayClassName="DialogDropdownOverlay">
        <span className="label">{label} ▼</span>
      </Dropdown>
      {activeOption ? (
        <div className="active-option">{activeOption.label}</div>
      ) : (
        <div className="active-option no-option">Choose from list...</div>
      )}
    </div>
  )
}
