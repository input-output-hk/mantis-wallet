import React from 'react'
import {BrowserRouter} from 'react-router-dom'
import Sidebar from '../src/components/Sidebar'

export default {
  title: 'Sidebar',
}

export const sidebar = (props: object) => (
  <BrowserRouter>
    <Sidebar />
  </BrowserRouter>
)
