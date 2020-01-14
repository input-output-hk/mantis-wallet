import React, {useState} from 'react'
import {Dropdown, Menu} from 'antd'
import './DialogDropdown.scss'

interface DialogDropdownProps {
  label: string
  options: Array<string>
}

export const DialogDropdown: React.FunctionComponent<DialogDropdownProps> = ({
  label,
  options,
}: DialogDropdownProps) => {
  const [activeOption, setActiveOption] = useState(options[0])

  const menu = (
    <Menu onClick={({key}): void => setActiveOption(key)}>
      {options.map((option) => (
        <Menu.Item key={option}>{option}</Menu.Item>
      ))}
    </Menu>
  )

  return (
    <div className="DialogDropdown">
      <Dropdown overlay={menu} overlayClassName="DialogDropdownOverlay">
        <span className="label">{label} ▼ </span>
      </Dropdown>
      <div className="active-option">{activeOption}</div>
    </div>
  )
}
