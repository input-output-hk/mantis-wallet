import {Menu, MenuItemConstructorOptions} from 'electron'
import {TFunctionMain} from './i18n'

const isMac = process.platform === 'darwin'

const appMenuForMac: MenuItemConstructorOptions[] = [
  {role: 'hide'},
  {role: 'hideOthers'},
  {role: 'unhide'},
  {type: 'separator'},
]

export const buildMenu = (openRemix: () => void, t: TFunctionMain): Menu => {
  const template: MenuItemConstructorOptions[] = [
    {
      label: 'Luna',
      submenu: [
        {label: t(['menu', 'openRemix']), click: openRemix},
        {type: 'separator'},
        ...(isMac ? appMenuForMac : []),
        {role: 'quit'},
      ],
    },
    {role: 'editMenu'},
    {role: 'viewMenu'},
  ]

  return Menu.buildFromTemplate(template)
}

export const buildRemixMenu = (_t: TFunctionMain): Menu => {
  const template: MenuItemConstructorOptions[] = [{role: 'editMenu'}, {role: 'viewMenu'}]

  return Menu.buildFromTemplate(template)
}
