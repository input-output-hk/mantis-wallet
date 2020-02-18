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
}
