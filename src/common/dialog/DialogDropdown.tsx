import React, {useState} from 'react'
import _ from 'lodash/fp'
import {Dropdown, Menu} from 'antd'
import {DialogError} from './DialogError'
import {Trans} from '../Trans'
import {TKeyRenderer} from '../i18n'
import './DialogDropdown.scss'

interface DialogDropdownOption<T> {
  key: T
  label: React.ReactNode
}

interface DialogDropdownProps<T> {
  label: string
  options: ReadonlyArray<T | DialogDropdownOption<T>>
  defaultOptionIndex?: number
  selectedKey?: T
  onChange?: (option: T) => void
  noOptionsMessage?: TKeyRenderer
}

export const DialogDropdown = <T extends string>({
  label,
  options,
  defaultOptionIndex = 0,
  onChange,
  selectedKey,
  noOptionsMessage = ['common', 'error', 'noAvailableOptionForDropdown'],
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

  const renderActiveOption = (): JSX.Element => {
    if (trueOptions.length === 0) {
      return (
        <DialogError>
          <Trans k={noOptionsMessage} />
        </DialogError>
      )
    }

    if (selectedKey) {
      const selectedItem = trueOptions.find((option) => option.key === selectedKey)

      if (selectedItem) {
        return <div className="active-option">{selectedItem.label}</div>
      } else {
        return (
          <div className="active-option no-option">
            <Trans k={['common', 'message', 'chooseFromDropdownList']} />
          </div>
        )
      }
    }

    return (
      <>
        {trueOptions.length > 0 && activeOption && (
          <div className="active-option">{activeOption.label}</div>
        )}
        {trueOptions.length > 0 && !activeOption && (
          <div className="active-option no-option">
            <Trans k={['common', 'message', 'chooseFromDropdownList']} />
          </div>
        )}
      </>
    )
  }
  return (
    <div className="DialogDropdown">
      <Dropdown overlay={menu} overlayClassName="DialogDropdownOverlay">
        <span className="label">{label} ▼</span>
      </Dropdown>
      {renderActiveOption()}
    </div>
  )
}
