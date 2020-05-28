import {packageLuna} from './lib/package'
import {TargetPlatform} from 'electron-packager'

const platforms: TargetPlatform[] = ['darwin', 'linux']

platforms.map((platform) => packageLuna({platform}))
