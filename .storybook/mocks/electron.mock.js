const mockedGlobal = {
  lunaConfig: {},
  lunaManagedConfig: {},
  lunaStatus: {
    fetchParams: {
      status: 'not-running',
    },
    wallet: {
      status: 'not-running',
    },
    node: {
      status: 'not-running',
    },
    dag: {
      status: 'not-running',
    },
    info: {
      platform: 'Linux',
      platformVersion: '10.0.0',
      cpu: 'Intel CPU',
      memory: 12345678,

      lunaVersion: 'v0.11.0',
      mainPid: 123,
    },
  },
}

module.exports = {
  remote: {
    getGlobal: (name) => mockedGlobal[name],
  },
  ipcRenderer: {
    on: () => undefined,
    removeAllListeners: () => undefined,
    send: () => undefined,
  },
  shell: {
    openExternal: () => undefined,
  },
}
