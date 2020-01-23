import React from 'react'
import {Tabs} from 'antd'
import './DialogTabs.scss'

const {TabPane} = Tabs

interface DialogTabProps {
  label: string
  content: React.ReactNode
}

interface DialogTabsProps {
  tabs: DialogTabProps[]
}

export const DialogTabs: React.FunctionComponent<DialogTabsProps> = ({tabs}: DialogTabsProps) => {
  return (
    <div className="DialogTabs">
      <Tabs>
        {tabs.map(({label, content}) => (
          <TabPane key={label} tab={label}>
            {content}
          </TabPane>
        ))}
      </Tabs>
    </div>
  )
}
