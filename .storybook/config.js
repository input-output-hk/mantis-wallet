import url from 'url'
import React, {useEffect} from 'react'
import {configure, addDecorator} from '@storybook/react'
import requireContext from 'require-context.macro'
import '../src/index.scss'
import '../src/App.scss'
// At the end intentionally, so we can test if antd overrides work properly:
import 'antd/dist/antd.less'
// Custom story overrides, e.g. disable antimations
import './storybook.scss'

const AppDecorator = (storyFn) => {
  useEffect(() => {
    // set Mantis body class for antd overwrites
    document.body.id = 'Mantis'

    const currentURL = url.parse(window.location.href, true)
    if (currentURL.query['disable-animations'] === 'true') {
      document.body.classList.add('disable-animations')
    }
  }, [])

  return (
    <div id="App" className="storybook-app storybook-modal-root">
      <main id="main">{storyFn()}</main>
    </div>
  )
}
addDecorator(AppDecorator)

// automatically import all files ending in *.stories.js
configure(requireContext('../src', true, /\.stories\.tsx$/), module)
