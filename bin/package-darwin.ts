import {packageLuna} from './lib/package'
import {TargetPlatform} from 'electron-packager'

const platforms: TargetPlatform[] = ['darwin']

platforms.map((platform) => packageLuna({platform}))
