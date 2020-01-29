import {packageLuna} from './lib/package'
import * as electronPackager from 'electron-packager'

const platforms: electronPackager.platform[] = ['darwin', 'linux']

platforms.map((platform) => packageLuna({platform}))
