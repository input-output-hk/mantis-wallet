import {TargetPlatform} from 'electron-packager'
import {packageMantisWallet} from './lib/package'

const platforms: TargetPlatform[] = ['linux']

platforms.map((platform) => packageMantisWallet({platform}))
