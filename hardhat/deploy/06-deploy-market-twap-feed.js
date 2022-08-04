const { getNamedAccounts, deployments, network, ethers } = require("hardhat");
const { networkConfig, developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    const PriceRefreshInterval = 3600; // 60 min
    const TwapInterval = 24; // twap window 24h

    let lendingPoolAddress = ethers.constants.AddressZero;

    log("----------------------------------------------------");
    log("Deploying MarketTwapFeed and waiting for confirmations...");
    const MarketTwapFeed = await deploy("MarketTwapFeed", {
        from: deployer,
        args: [PriceRefreshInterval, TwapInterval, lendingPoolAddress],
        log: true,
        // wait if on a live network so we can verify properly
        waitConfirmations: network.config.blockConfirmations || 1,
    });
    log(`MarketTwapFeed deployed at ${MarketTwapFeed.address}`);

    // verify contract on etherscan
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(EthTwapFeed.address, [
            PriceRefreshInterval,
            TwapInterval,
            lendingPoolAddress,
        ]);
    }
};

module.exports.tags = ["all", "markettwapfeed"];
