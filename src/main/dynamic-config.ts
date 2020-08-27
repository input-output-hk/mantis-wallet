import {promisify} from 'util'
import {promises as fs} from 'fs'
import {exec} from 'child_process'
import * as _ from 'lodash/fp'
import {processEnv, processExecutablePath} from './MidnightProcess'
import {LunaManagedConfig, ProcessConfig, SettingsPerClient} from '../config/type'
import {loadLunaManagedConfig, lunaManagedConfigPath} from '../config/main'
import {mainLog} from './logger'
import {createTErrorMain} from './i18n'

const getPrivateCoinbaseOptionPath = (option: 'pkd' | 'diversifier' | 'ovk'): string =>
  `midnight.mining.private-coinbase.${option}`

export async function getCoinbaseParams(
  walletBackendConfig: ProcessConfig,
  spendingKey: string,
): Promise<Pick<LunaManagedConfig, 'pkd' | 'diversifier' | 'ovk'>> {
  const walletBackendExecPath = processExecutablePath(walletBackendConfig)
  const command = `${walletBackendExecPath} coinbase-entry --format JSON --key ${spendingKey} --for-account`
  try {
    const {stdout, stderr} = await promisify(exec)(command, {
      cwd: walletBackendConfig.packageDirectory,
      env: processEnv(walletBackendConfig),
    })
    if (stdout) mainLog.info(stdout)
    if (stderr) mainLog.error(stderr)

    const parsed = JSON.parse(stdout)
    return {
      pkd: parsed[getPrivateCoinbaseOptionPath('pkd')],
      diversifier: parsed[getPrivateCoinbaseOptionPath('diversifier')],
      ovk: parsed[getPrivateCoinbaseOptionPath('ovk')],
    }
  } catch (e) {
    mainLog.error(e)
    throw createTErrorMain(['error', 'invalidSpendingKey'])
  }
}

export async function updateConfig(toUpdate: Partial<LunaManagedConfig>): Promise<void> {
  const previousConfig = loadLunaManagedConfig()
  const newConfig = _.merge(previousConfig)(toUpdate)
  mainLog.info('Config changed')
  mainLog.info({previousConfig, newConfig})
  await fs.writeFile(lunaManagedConfigPath, JSON.stringify(newConfig, null, 2), 'utf8')
}

export async function getMiningParams(): Promise<SettingsPerClient> {
  const currentConfig = await loadLunaManagedConfig()
  if (!currentConfig.miningEnabled) {
    return SettingsPerClient({
      node: {
        'midnight.mining.mining-enabled': 'false',
      },
    })
  } else {
    return SettingsPerClient({
      node: {
        [getPrivateCoinbaseOptionPath('pkd')]: currentConfig.pkd,
        [getPrivateCoinbaseOptionPath('diversifier')]: currentConfig.diversifier,
        [getPrivateCoinbaseOptionPath('ovk')]: currentConfig.ovk,
        'midnight.mining.mining-enabled': 'true',
      },
    })
  }
}
