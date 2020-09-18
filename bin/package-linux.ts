import {TargetPlatform} from 'electron-packager'
import {packageLuna} from './lib/package'

const platforms: TargetPlatform[] = ['linux']

platforms.map((platform) => packageLuna({platform}))
