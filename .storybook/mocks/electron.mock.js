module.exports = {
  remote: {
    getGlobal: () => ({
      provers: [
        {
          name: 'Test prover',
          address: 'test-address',
        },
      ],
    }),
  },
  ipcRenderer: {
    on: () => undefined,
    removeAllListeners: () => undefined,
    send: () => undefined,
  },
}
