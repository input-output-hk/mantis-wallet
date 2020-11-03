import {TargetPlatform} from 'electron-packager'
import {packageMantisWallet} from './lib/package'

const platforms: TargetPlatform[] = ['darwin']

platforms.map((platform) => packageMantisWallet({platform}))
