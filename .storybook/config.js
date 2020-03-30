import React, {useEffect} from 'react'
import {configure, addDecorator} from '@storybook/react'
import requireContext from 'require-context.macro'
import 'antd/dist/antd.less'
import '../src/App.scss'
import '../src/index.scss'

const AppDecorator = (storyFn) => {
  useEffect(() => {
    // set Luna body class for antd overwrites
    document.body.classList.add('Luna')
  }, [])
  return (
    <div
      className="App"
      style={{
        gridTemplateColumns: '1fr',
        gridTemplateRows: '1fr',
        minHeight: '100vh',
        overflow: 'auto',
        padding: '24px',
      }}
    >
      <main>{storyFn()}</main>
    </div>
  )
}
addDecorator(AppDecorator)

// automatically import all files ending in *.stories.js
configure(requireContext('../src', true, /\.stories\.tsx$/), module)
