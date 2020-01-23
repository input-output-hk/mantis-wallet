import React from 'react'
import {BrowserRouter} from 'react-router-dom'
import {Sidebar} from './Sidebar'

export default {
  title: 'Sidebar',
}

export const sidebar = (): JSX.Element => (
  <BrowserRouter>
    <Sidebar />
  </BrowserRouter>
)
