import {addons} from '@storybook/addons'
import {create} from '@storybook/theming'
import {registerLanguageChanger, registerThemeSwitcher} from './custom-addons'
import logo from '../src/assets/logo.svg'

registerLanguageChanger()
registerThemeSwitcher()

addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'Mantis Stories',
    brandImage: logo,
  }),
  showPanel: true,
  showNav: true,
  isToolshown: true,
  sidebarAnimations: false,
})
