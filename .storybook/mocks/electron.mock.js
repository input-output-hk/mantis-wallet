const mockedGlobal = {
  lunaConfig: {
    rpcAddress: 'localhost:1234',
  },
  lunaStatus: {
    fetchParams: {
      status: 'notRunning',
    },
    wallet: {
      status: 'notRunning',
    },
    node: {
      status: 'notRunning',
    },
    dag: {
      status: 'notRunning',
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
