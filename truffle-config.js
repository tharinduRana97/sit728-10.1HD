module.exports = {
  networks: {
    development: {
      host: "127.0.0.1", // Localhost (default: none)
      port: 7545, // Standard Ethereum port (default: none)
      network_id: "*", // Any network (default: none)
    },
  },
  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.17", // Fetch exact version from solc-bin (default: "0.5.16")
      settings: {
        optimizer: {
          enabled: true, // Enable optimization
          runs: 200, // Optimize for how many times you intend to run the code
        },
      },
    },
  },
};
