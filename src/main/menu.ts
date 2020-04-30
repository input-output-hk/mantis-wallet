import {Menu, MenuItemConstructorOptions} from 'electron'

const isMac = process.platform === 'darwin'

const appMenuForMac: MenuItemConstructorOptions[] = [
  {role: 'hide'},
  {role: 'hideOthers'},
  {role: 'unhide'},
  {type: 'separator'},
]

export const buildMenu = (openRemix: () => void): Menu => {
  const template: MenuItemConstructorOptions[] = [
    {
      label: 'Luna',
      submenu: [
        {label: 'Open Remix IDE', click: openRemix},
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

export const buildRemixMenu = (): Menu => {
  const template: MenuItemConstructorOptions[] = [{role: 'editMenu'}, {role: 'viewMenu'}]

  return Menu.buildFromTemplate(template)
}
