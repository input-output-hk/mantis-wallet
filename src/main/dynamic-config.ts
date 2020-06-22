import {promisify} from 'util'
import {promises as fs} from 'fs'
import {exec} from 'child_process'
import * as _ from 'lodash/fp'
import {processEnv, processExecutablePath} from './MidnightProcess'
import {LunaManagedConfig, ProcessConfig, SettingsPerClient} from '../config/type'
import {loadLunaManagedConfig, lunaManagedConfigPath} from '../config/main'

const getPrivateCoinbaseOptionPath = (option: 'pkd' | 'diversifier' | 'ovk'): string =>
  `midnight.consensus.private-coinbase.${option}`

export async function getCoinbaseParams(
  walletBackendConfig: ProcessConfig,
  spendingKey: string,
): Promise<Pick<LunaManagedConfig, 'pkd' | 'diversifier' | 'ovk'>> {
  const walletBackendExecPath = processExecutablePath(walletBackendConfig)
  const command = `${walletBackendExecPath} coinbase-entry --format JSON --key ${spendingKey}`
  try {
    const {stdout, stderr} = await promisify(exec)(command, {
      cwd: walletBackendConfig.packageDirectory,
      env: processEnv(walletBackendConfig),
    })
    console.info(stdout)
    console.error(stderr)

    const parsed = JSON.parse(stdout)
    return {
      pkd: parsed[getPrivateCoinbaseOptionPath('pkd')],
      diversifier: parsed[getPrivateCoinbaseOptionPath('diversifier')],
      ovk: parsed[getPrivateCoinbaseOptionPath('ovk')],
    }
  } catch (e) {
    console.error(e)
    throw Error('Possibly invalid spending key.')
  }
}

export async function updateConfig(toUpdate: Partial<LunaManagedConfig>): Promise<void> {
  const previousConfig = loadLunaManagedConfig()
  const newConfig = _.merge(previousConfig)(toUpdate)
  console.info('Config changed')
  console.info({previousConfig, newConfig})
  await fs.writeFile(lunaManagedConfigPath, JSON.stringify(newConfig, undefined, 2), 'utf8')
}

export async function getMiningParams(): Promise<SettingsPerClient> {
  const currentConfig = await loadLunaManagedConfig()
  if (!currentConfig.miningEnabled) {
    return SettingsPerClient({
      node: {
        'midnight.consensus.mining-enabled': 'false',
      },
    })
  } else {
    return SettingsPerClient({
      node: {
        [getPrivateCoinbaseOptionPath('pkd')]: currentConfig.pkd,
        [getPrivateCoinbaseOptionPath('diversifier')]: currentConfig.diversifier,
        [getPrivateCoinbaseOptionPath('ovk')]: currentConfig.ovk,
        'midnight.consensus.mining-enabled': 'true',
      },
    })
  }
}
