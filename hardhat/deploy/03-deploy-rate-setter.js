const { getNamedAccounts, deployments, network } = require("hardhat");
const { networkConfig, developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    let cdpManagerAddress;
    let ethUsdPriceFeedAddress;
    let cpiDataFeedAddress;

    if (chainId == 31337) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
        cdpManagerAddress = ethers.constants.AddressZero;
        cpiDataFeedAddress = ethers.constants.AddressZero;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    }
    log("----------------------------------------------------");
    log("Deploying RateSetter and waiting for confirmations...");
    const rateSetter = await deploy("RateSetter", {
        from: deployer,
        args: [cdpManagerAddress, ethUsdPriceFeedAddress, cpiDataFeedAddress],
        log: true,
        // wait if on a live network so we can verify properly
        waitConfirmations: network.config.blockConfirmations || 1,
    });
    log(`RateSetter deployed at ${rateSetter.address}`);

    // verify contract on etherscan
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(rateSetter.address, [cdpManagerAddress, ethUsdPriceFeedAddress, cpiDataFeedAddress]);
    }
};

module.exports.tags = ["all", "ratesetter"];
