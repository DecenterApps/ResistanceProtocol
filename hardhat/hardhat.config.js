require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle")

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const KOVAN_RPC_URL = process.env.KOVAN_RPC_URL;
const KOVAN_ACCOUNT = process.env.KOVAN_ACCOUNT;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            allowUnlimitedContractSize: true,
            accounts: {
                count: 100
            }
        },
        kovan: {
            url: KOVAN_RPC_URL,
            accounts: [KOVAN_ACCOUNT],
            chainId: 42,
            blockConfirmations: 1,
        },
        local: {
            url: "https://127.0.0.1:8545",
            allowUnlimitedContractSize: true
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    solidity: {
        compilers: [
            {
                version: "0.8.9",
            },
            {
                version: "0.6.6",
            },
        ],
    },
    namedAccounts: {
        deployer: {
            default: 0, // here this will by default take the first account as deployer
        },
    },
};
