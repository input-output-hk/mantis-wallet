import {Menu, MenuItemConstructorOptions} from 'electron'
import {TFunctionMain} from './i18n'

const isMac = process.platform === 'darwin'

const localizedAppMenuForMac = (t: TFunctionMain): MenuItemConstructorOptions[] => [
  {label: t(['menu', 'hide']), role: 'hide'},
  {label: t(['menu', 'hideOthers']), role: 'hideOthers'},
  {label: t(['menu', 'unhide']), role: 'unhide'},
  {type: 'separator'},
]

const localizedSharedMenu = (t: TFunctionMain): MenuItemConstructorOptions[] => [
  {
    label: t(['menu', 'edit']),
    submenu: [
      {label: t(['menu', 'undo']), role: 'undo'},
      {label: t(['menu', 'redo']), role: 'redo'},
      {type: 'separator'},
      {label: t(['menu', 'cut']), role: 'cut'},
      {label: t(['menu', 'copy']), role: 'copy'},
      {label: t(['menu', 'paste']), role: 'paste'},
      {label: t(['menu', 'delete']), role: 'delete'},
      {type: 'separator'},
      {label: t(['menu', 'selectAll']), role: 'selectAll'},
    ],
  },
  {
    label: t(['menu', 'view']),
    submenu: [
      {label: t(['menu', 'reload']), role: 'reload'},
      {label: t(['menu', 'forceReload']), role: 'forceReload'},
      {label: t(['menu', 'toggleDevTools']), role: 'toggleDevTools'},
      {type: 'separator'},
      {label: t(['menu', 'resetZoom']), role: 'resetZoom'},
      {label: t(['menu', 'zoomIn']), role: 'zoomIn'},
      {label: t(['menu', 'zoomOut']), role: 'zoomOut'},
      {type: 'separator'},
      {label: t(['menu', 'toggleFullScreen']), role: 'togglefullscreen'},
    ],
  },
]

export const buildMenu = (t: TFunctionMain): Menu => {
  const template: MenuItemConstructorOptions[] = [
    {
      label: t(['menu', 'Luna']),
      submenu: [
        ...(isMac ? localizedAppMenuForMac(t) : []),
        {label: t(['menu', 'quit']), role: 'quit'},
      ],
    },
    ...localizedSharedMenu(t),
  ]

  return Menu.buildFromTemplate(template)
}
