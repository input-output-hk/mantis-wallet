import {Config} from '../type'

export const config: Config = {
  rpcAddress: new URL('localhost:1234'),
} as Config

export const loadConfig = (): Config => config

export const loadLunaStatus = (): LunaStatus => ({
  node: {
    status: 'notRunning',
  },
  dag: {
    status: 'notRunning',
  },
  info: {
    platform: 'Linux',
    platformVersion: 'Linux X',
    cpu: 'Intel',
    memory: 16000000,

    lunaVersion: '0.11.0',
    mainPid: 1234,
  },
})
