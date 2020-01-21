import React from 'react'
import {Tabs} from 'antd'
import {BorderlessInput} from '../BorderlessInput'
import './DialogTabbedInput.scss'

const {TabPane} = Tabs

interface DialogTabbedInputProps {
  labels: string[]
}

export const DialogTabbedInput: React.FunctionComponent<DialogTabbedInputProps> = ({
  labels,
}: DialogTabbedInputProps) => {
  return (
    <div className="DialogTabbedInput">
      <Tabs>
        {labels.map((label) => (
          <TabPane key={label} tab={label}>
            <BorderlessInput className="input" />
          </TabPane>
        ))}
      </Tabs>
    </div>
  )
}
