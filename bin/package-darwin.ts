import {TargetPlatform} from 'electron-packager'
import {packageLuna} from './lib/package'

const platforms: TargetPlatform[] = ['darwin']

platforms.map((platform) => packageLuna({platform}))
