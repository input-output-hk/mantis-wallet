import React from 'react'
import {configure, addDecorator} from '@storybook/react'
import '../src/App.scss'
import '../src/index.scss'

const AppDecorator = (storyFn) => <div className="App">{storyFn()}</div>
addDecorator(AppDecorator)

// automatically import all files ending in *.stories.js
configure(require.context('../src', true, /\.stories\.tsx$/), module)
