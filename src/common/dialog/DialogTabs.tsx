import React from 'react'
import {Tabs} from 'antd'
import './DialogTabs.scss'

const {TabPane} = Tabs

interface DialogTabProps<T extends string> {
  label: T
  content: React.ReactNode
}

interface DialogTabsProps<T extends string> {
  tabs: Array<DialogTabProps<T>>
  onTabClick?: (key: T) => void
}

export const DialogTabs = <T extends string>({
  tabs,
  onTabClick,
}: DialogTabsProps<T>): JSX.Element => {
  return (
    <div className="DialogTabs">
      <Tabs onTabClick={onTabClick}>
        {tabs.map(({label, content}) => (
          <TabPane key={label} tab={label}>
            {content}
          </TabPane>
        ))}
      </Tabs>
    </div>
  )
}
