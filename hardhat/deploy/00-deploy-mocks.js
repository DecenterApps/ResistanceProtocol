const { network } = require("hardhat");

const DECIMALS = "8";
const INITIAL_ETH_PRICE = "166925570000";

const INITIAL_CPI = "1048699183321964674";

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    // If on localhost, deploy mock
    if (chainId == 31337) {
        log("Deploying mocks...");
        await deploy("EthPriceFeedMock", {
            contract: "EthPriceFeedMock",
            from: deployer,
            log: true,
            args: [INITIAL_ETH_PRICE],
        });
    }

    // cpi data feed doesnt exist for testnet so we mock it
    if(chainId != 1) {
        await deploy("CPIDataFeedMock", {
            contract: "CPIDataFeedMock",
            from: deployer,
            log: true,
            args: [INITIAL_CPI],
        });
    }
};
module.exports.tags = ["all", "mocks"];
