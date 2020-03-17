import React, {useState} from 'react'
import {addons, types} from '@storybook/addons'
import {
  THEME_SWITHER_ADDON_ID,
  THEME_SWITHER_CHANGE,
} from '../../src/storybook-util/theme-switcher-constants.ts'

const ThemeSwitch = ({api}) => {
  const [theme, setTheme] = useState('dark')

  const handleClick = (theme) => () => {
    setTheme(theme)
    api.emit(THEME_SWITHER_CHANGE, theme)
  }

  const style = {
    display: 'block',
    margin: '5px',
    padding: '5px 10px',
    outline: 'none',
    verticalAlign: 'middle',
    fontSize: '14px',
    fontWeight: 'bold',
    lineHeight: '20px',
    userSelect: 'none',
    cursor: 'pointer',
  }

  return (
    <>
      {theme === 'light' && (
        <span
          onClick={handleClick('dark')}
          style={{color: '#f7f7f7', backgroundColor: '#000', ...style}}
        >
          Switch to Dark Theme
        </span>
      )}
      {theme === 'dark' && (
        <span
          onClick={handleClick('light')}
          style={{color: '#000', backgroundColor: '#f7f7f7', ...style}}
        >
          Switch to Light Theme
        </span>
      )}
    </>
  )
}

addons.register(THEME_SWITHER_ADDON_ID, (api) => {
  addons.add(THEME_SWITHER_ADDON_ID, {
    title: 'Themes',
    type: types.TOOL,
    match: ({viewMode}) => viewMode === 'story',
    render: () => <ThemeSwitch api={api} />,
  })
})
