import React, {useState} from 'react'
import {addons, types} from '@storybook/addons'
import {
  THEME_SWITCHER_ADDON_ID,
  THEME_SWITCHER_CHANGE,
} from '../../src/storybook-util/shared-constants.ts'
import {darkButtonStyle, lightButtonStyle} from './styles'

const ThemeSwitch = ({api}) => {
  const [theme, setTheme] = useState('dark')

  const handleClick = (theme) => () => {
    setTheme(theme)
    api.emit(THEME_SWITCHER_CHANGE, theme)
  }

  return (
    <>
      {theme === 'light' && (
        <span onClick={handleClick('dark')} style={darkButtonStyle}>
          Switch to Dark Theme
        </span>
      )}
      {theme === 'dark' && (
        <span onClick={handleClick('light')} style={lightButtonStyle}>
          Switch to Light Theme
        </span>
      )}
    </>
  )
}

export const registerThemeSwitcher = () => addons.register(THEME_SWITCHER_ADDON_ID, (api) => {
  addons.add(THEME_SWITCHER_ADDON_ID, {
    title: 'Themes',
    type: types.TOOL,
    match: ({viewMode}) => viewMode === 'story',
    render: () => <ThemeSwitch api={api} />,
  })
})
