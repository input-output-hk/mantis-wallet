module.exports = {
  create: () => ({
    error: console.error,
    info: console.info,
    debug: console.debug,
    log: console.log,
    warn: console.log,
    transports: {file: {}},
  }),
}
