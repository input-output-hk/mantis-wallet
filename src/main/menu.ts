import {Menu, MenuItemConstructorOptions} from 'electron'

const isMac = process.platform === 'darwin'

const appMenuForMac: MenuItemConstructorOptions[] = [
  {role: 'hide'},
  {role: 'hideOthers'},
  {role: 'unhide'},
  {type: 'separator'},
]

const template: MenuItemConstructorOptions[] = [
  {
    label: 'Luna',
    submenu: [...(isMac ? appMenuForMac : []), {role: 'quit'}],
  },
  {role: 'editMenu'},
  {role: 'viewMenu'},
]

export const buildMenu = (): Menu => Menu.buildFromTemplate(template)
