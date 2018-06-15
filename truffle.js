require('babel-register')({
    ignore: /node_modules\/(?!openzeppelin-solidity)/
});
require('babel-polyfill');

module.exports = {
  migrations_directory: "./migrations",
  networks: {
      development: {
          host: "localhost",
          port: 8545,
          network_id: "*" // Match any network id
      }
      // ,
      // private: {
      //     host: "localhost",
      //     port: 8545,
      //     network_id: 10030 // Match any network id
      // }
  }
};
