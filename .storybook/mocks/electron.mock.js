const mockedGlobal = {
  mantisWalletConfig: {
    rpcAddress: 'localhost:1234',
    mantis: {
      dataDir: null,
    },
  },
  mantisWalletStatus: {
    fetchParams: {
      status: 'notRunning',
    },
    wallet: {
      status: 'notRunning',
    },
    node: {
      status: 'notRunning',
    },
    info: {
      platform: 'Linux',
      platformVersion: '10.0.0',
      cpu: 'Intel CPU',
      memory: 12345678,

      mantisWalletVersion: 'v0.11.0',
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
