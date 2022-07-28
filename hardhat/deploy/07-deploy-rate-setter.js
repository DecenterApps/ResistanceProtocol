const { getNamedAccounts, deployments, network, ethers } = require("hardhat");
const { networkConfig, developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    let ethUsdPriceFeedAddress;
    let cpiDataFeedAddress;

    if (chainId == 31337) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
        cpiDataFeedAddress = ethers.constants.AddressZero;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    }
    log("----------------------------------------------------");
    log("Deploying RateSetter and waiting for confirmations...");

    const cdpManager = await ethers.getContract("CDPManager", deployer);
    const absPiController = await ethers.getContract("AbsPiController", deployer);

    const rateSetter = await deploy("RateSetter", {
        from: deployer,
        args: [cdpManager.address, absPiController.address, ethUsdPriceFeedAddress, cpiDataFeedAddress],
        log: true,
        // wait if on a live network so we can verify properly
        waitConfirmations: network.config.blockConfirmations || 1,
    });
    log(`RateSetter deployed at ${rateSetter.address}`);

    // verify contract on etherscan
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(rateSetter.address, [cdpManager.address, absPiController.address, ethUsdPriceFeedAddress, cpiDataFeedAddress]);
    }
};

module.exports.tags = ["all", "ratesetter"];
