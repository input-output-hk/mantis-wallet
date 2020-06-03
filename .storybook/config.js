import url from 'url'
import React, {useEffect} from 'react'
import {configure, addDecorator} from '@storybook/react'
import requireContext from 'require-context.macro'
import 'antd/dist/antd.less'
import '../src/App.scss'
import '../src/index.scss'
import './storybook.scss'

const AppDecorator = (storyFn) => {
  useEffect(() => {
    // set Luna body class for antd overwrites
    document.body.classList.add('Luna')

    const currentURL = url.parse(window.location.href, true)
    if (currentURL.query['disable-animations'] === 'true') {
      document.body.classList.add('disable-animations')
    }
  }, [])

  return (
    <div className="App storybook-app">
      <main id="main">{storyFn()}</main>
    </div>
  )
}
addDecorator(AppDecorator)

// automatically import all files ending in *.stories.js
configure(requireContext('../src', true, /\.stories\.tsx$/), module)
