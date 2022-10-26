require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy")
require("hardhat-gas-reporter")
// const dotenv = require("dotenv");
// dotenv.config({ path: __dirname + '/.env' });

const RINKEBY_RPC_URL = "https://eth-goerli.g.alchemy.com/v2/XazaPfHoW4PczRA1DcliI6OYgortxJO6"
const PRIVATE_KEY = "b0e2686ddac8060754c2c2f9712a2bdafc94554a65765ce9078f58e9835ef0f8"
const ETHERSCAN_API_KEY = "K7WGBTQ5VEQ12MN9BRF69V7V6ERQNK2H6R"
// const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.17",
      },
      {
        version: "0.6.6",
      },
    ],
  },

  defaultNetwork: "hardhat",
  networks: {
    rinkeby: {
      url: RINKEBY_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 4,
      blockConfirmations: 6,
    }

  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    // coinmarketcap: COINMARKETCAP_API_KEY,
    token: "MATIC"
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    user: {
      default: 1,
    }
  }
};
