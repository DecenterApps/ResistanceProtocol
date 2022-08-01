const { getNamedAccounts, deployments, network, ethers } = require("hardhat");
const { networkConfig, developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    let ethUsdPriceFeedAddress, cpiDataFeedAddress;

    if (chainId == 31337) {
        // real for fork
        // ethUsdPriceFeedAddress = networkConfig[1].ethUsdPriceFeed;
        // cpiDataFeedAddress = networkConfig[1].cpiDataFeed;

        // mock contracts
        ethUsdPriceFeedAddress = (await ethers.getContract("EthPriceFeedMock", deployer)).address;
        cpiDataFeedAddress = (await ethers.getContract("CPIDataFeedMock", deployer)).address;
    } else if (chainId == 42) {
        // cpi for testnet doesnt exist so we mock
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed;
        cpiDataFeedAddress = (await ethers.getContract("CPIDataFeedMock", deployer)).address;
    } else if (chainId == 1) {
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed;
        cpiDataFeedAddress = networkConfig[chainId].cpiDataFeed;
    }

    const multiSigWalletAddress = (await ethers.getContract("MultiSigWallet", deployer)).address;

    log("----------------------------------------------------");
    log("Deploying RateSetter and waiting for confirmations...");

    const cdpManager = await ethers.getContract("CDPManager", deployer);
    const absPiController = await ethers.getContract("AbsPiController", deployer);

    const rateSetter = await deploy("RateSetter", {
        from: deployer,
        args: [
            multiSigWalletAddress,
            cdpManager.address,
            absPiController.address,
            ethUsdPriceFeedAddress,
            cpiDataFeedAddress,
        ],
        log: true,
        // wait if on a live network so we can verify properly
        waitConfirmations: network.config.blockConfirmations || 1,
    });
    log(`RateSetter deployed at ${rateSetter.address}`);

    // verify contract on etherscan
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(rateSetter.address, [
            multiSigWalletAddress,
            cdpManager.address,
            absPiController.address,
            ethUsdPriceFeedAddress,
            cpiDataFeedAddress,
        ]);
    }
};

module.exports.tags = ["all", "ratesetter"];
