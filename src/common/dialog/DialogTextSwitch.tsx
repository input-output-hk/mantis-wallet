import React, {useState} from 'react'
import {Button} from 'antd'
import classnames from 'classnames'
import './DialogTextSwitch.scss'

type SwitchMode<T> = {
  label: string
  type: T
}

export interface DialogTextSwitchProps<T> {
  defaultMode?: T
  left: SwitchMode<T>
  right: SwitchMode<T>
  buttonClassName?: string
  onChange: (mode: T) => void
}

export const DialogTextSwitch = <T extends string>({
  defaultMode,
  left,
  right,
  buttonClassName,
  onChange,
}: DialogTextSwitchProps<T>): JSX.Element => {
  const [mode, setMode] = useState<T>(defaultMode || left.type)

  const handleChange = (mode: T): void => {
    setMode(mode)
    onChange(mode)
  }

  return (
    <div className="DialogTextSwitch">
      <Button
        onClick={() => handleChange(left.type)}
        className={classnames('button', buttonClassName, mode === left.type ? 'left' : 'inactive')}
      >
        {left.label}
      </Button>
      <Button
        onClick={() => handleChange(right.type)}
        className={classnames(
          'button',
          buttonClassName,
          mode === right.type ? 'right' : 'inactive',
        )}
      >
        {right.label}
      </Button>
    </div>
  )
}
