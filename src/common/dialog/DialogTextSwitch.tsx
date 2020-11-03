import React, {useState} from 'react'
import {Button} from 'antd'
import classnames from 'classnames'
import './DialogTextSwitch.scss'

type SwitchMode<T> = {
  label: string
  type: T
}

export interface DialogTextSwitchProps<T> {
  label?: string
  defaultMode?: T
  left: SwitchMode<T>
  right: SwitchMode<T>
  buttonClassName?: string
  disabled?: boolean
  onChange: (mode: T) => void
}

export const DialogTextSwitch = <T extends string>({
  label,
  defaultMode,
  left,
  right,
  buttonClassName,
  disabled = false,
  onChange,
}: DialogTextSwitchProps<T>): JSX.Element => {
  const [mode, setMode] = useState<T>(defaultMode || left.type)

  const handleChange = (mode: T): void => {
    setMode(mode)
    onChange(mode)
  }

  return (
    <div className="DialogTextSwitch">
      {label && <div className="label">{label}</div>}
      <div className={classnames('switch-container', {'with-label': !!label})}>
        <Button
          onClick={() => handleChange(left.type)}
          className={classnames(
            'button',
            'left',
            buttonClassName,
            mode === left.type ? 'active' : 'inactive',
          )}
          disabled={disabled}
        >
          {left.label}
        </Button>
        <Button
          onClick={() => handleChange(right.type)}
          className={classnames(
            'button',
            'right',
            buttonClassName,
            mode === right.type ? 'active' : 'inactive',
          )}
          disabled={disabled}
        >
          {right.label}
        </Button>
      </div>
    </div>
  )
}
