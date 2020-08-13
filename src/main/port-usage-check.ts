import {getPortPromise} from 'portfinder'
import {config} from '../config/main'
import {TErrorMain} from './i18n'

const requiredPorts = [config.nodeRpcPort, config.walletRpcPort]

const getBlockedPorts = (): Promise<number[]> =>
  Promise.all(
    requiredPorts.map(
      (port: number): Promise<number[]> =>
        getPortPromise({port, stopPort: port})
          .then(() => [])
          .catch(() => [port]),
    ),
  ).then((r) => r.flat())

export async function checkPortUsage(): Promise<void> {
  const blockedPorts = await getBlockedPorts()
  if (blockedPorts.length > 0) {
    const ports = blockedPorts.join(', ')
    throw new TErrorMain(`Ports in use ${ports}`, ['error', 'portsAlreadyInUse'], {
      replace: {ports},
    })
  }
}