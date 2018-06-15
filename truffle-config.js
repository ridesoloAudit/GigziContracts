module.exports = {
  migrations_directory: "./migrations",
  networks: {
    development: {
      host: "testrpc",
      port: 8545,
      network_id: "*" // Match any network id
    }
    // , 
    // private: {
    //     host: "127.0.0.1",
    //     port: 30303,
    //     network_id: 10030 // Match any network id
    // }
      
  }
};
