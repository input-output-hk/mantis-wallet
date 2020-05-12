import {promisify} from 'util'
import {promises as fs} from 'fs'
import {exec} from 'child_process'
import * as _ from 'lodash/fp'
import {processExecutablePath} from './MidnightProcess'
import {LunaManagedConfigPaths} from '../shared/ipc-types'
import {ProcessConfig, LunaManagedConfig} from '../config/type'
import {config, loadLunaManagedConfig, lunaManagedConfigPath} from '../config/main'
import {ipcListen} from './util'

const getPrivateCoinbaseOptionPath = (option: 'pkd' | 'diversifier' | 'ovk'): string =>
  `midnight.consensus.private-coinbase.${option}`

async function getCoinbaseParams(
  walletBackendConfig: ProcessConfig,
  spendingKey: string,
): Promise<Pick<LunaManagedConfig, 'pkd' | 'diversifier' | 'ovk'>> {
  const walletBackendExecPath = processExecutablePath(walletBackendConfig)
  const command = `${walletBackendExecPath} coinbase-entry --format JSON --key ${spendingKey}`
  try {
    const {stdout, stderr} = await promisify(exec)(command, {
      cwd: walletBackendConfig.packageDirectory,
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

async function updateConfig(toUpdate: Partial<LunaManagedConfig>): Promise<void> {
  const previousConfig = loadLunaManagedConfig()
  const newConfig = _.merge(previousConfig)(toUpdate)
  console.info('Config changed')
  console.info({previousConfig, newConfig})
  await fs.writeFile(lunaManagedConfigPath, JSON.stringify(newConfig, undefined, 2), 'utf8')
}

ipcListen('update-config', async (event, keyPath: LunaManagedConfigPaths, value: string) => {
  try {
    await updateConfig({[keyPath]: value})
    event.reply('update-config-success')
  } catch (e) {
    console.error(e)
    event.reply('update-config-failure', e.message)
  }
})

ipcListen('update-mining-config', async (event, spendingKey: string | null) => {
  if (!spendingKey) {
    // Disable mining
    console.info('Disabling mining')
    try {
      await updateConfig({miningEnabled: false})
    } catch (e) {
      return event.reply('disable-mining-failure', e.message)
    }
    event.reply('disable-mining-success')
    event.reply('update-config-success')
  } else {
    // Enable mining
    console.info('Enabling mining')
    try {
      const coinbaseParams = await getCoinbaseParams(config.clientConfigs.wallet, spendingKey)
      await updateConfig({miningEnabled: true, ...coinbaseParams})
    } catch (e) {
      return event.reply('enable-mining-failure', e.message)
    }
    event.reply('enable-mining-success')
    event.reply('update-config-success')
  }
})

export async function getMiningParams(): Promise<{node: Record<string, string | null>}> {
  const currentConfig = await loadLunaManagedConfig()
  if (!currentConfig.miningEnabled) {
    return {
      node: {
        'midnight.consensus.mining-enabled': 'false',
      },
    }
  } else {
    return {
      node: {
        [getPrivateCoinbaseOptionPath('pkd')]: currentConfig.pkd,
        [getPrivateCoinbaseOptionPath('diversifier')]: currentConfig.diversifier,
        [getPrivateCoinbaseOptionPath('ovk')]: currentConfig.ovk,
        'midnight.consensus.mining-enabled': 'true',
      },
    }
  }
}
