import React, {useEffect} from 'react'
import {configure, addDecorator} from '@storybook/react'
import 'antd/dist/antd.less'
import '../src/App.scss'
import '../src/index.scss'

const AppDecorator = (storyFn) => {
  useEffect(() => {
    // set Luna body class for antd overwrites
    document.body.classList.add('Luna')
  }, [])
  return (
    <div className="App" style={{gridTemplateColumns: '1fr'}}>
      {storyFn()}
    </div>
  )
}
addDecorator(AppDecorator)

// automatically import all files ending in *.stories.js
configure(require.context('../src', true, /\.stories\.tsx$/), module)
