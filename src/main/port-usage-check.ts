import {getPortPromise} from 'portfinder'
import {createTErrorMain} from './i18n'
import {Config} from '../config/type'

const getBlockedPorts = (requiredPorts: number[]): Promise<number[]> => {
  return Promise.all(
    requiredPorts.map(
      (port: number): Promise<number[]> =>
        getPortPromise({port, stopPort: port})
          .then(() => [])
          .catch(() => [port]),
    ),
  ).then((r) => r.flat())
}

export async function checkPortUsage(config: Config): Promise<void> {
  const requiredPorts = [parseInt(config.rpcAddress.port)]
  const blockedPorts = await getBlockedPorts(requiredPorts)
  if (blockedPorts.length > 0) {
    const ports = blockedPorts.join(', ')
    throw createTErrorMain(['error', 'portsAlreadyInUse'], {
      replace: {ports},
    })
  }
}
