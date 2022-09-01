const { getNamedAccounts, deployments, network, ethers } = require("hardhat");
const { networkConfig, developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    let cpiDataFeedAddress;

    if (chainId == 31337 || chainId == 42) {
        // real for fork
        // cpiDataFeedAddress = networkConfig[1].cpiDataFeed;
        // mock contracts
        cpiDataFeedAddress = (await ethers.getContract("CPIDataFeedMock", deployer)).address;
    } else {
        cpiDataFeedAddress = networkConfig[chainId].cpiDataFeed;
    }

    let ethTwapFeedAddress = (await ethers.getContract("EthTwapFeed", deployer)).address;

    const multiSigWalletAddress = (await ethers.getContract("MultiSigWallet", deployer)).address;

    log("----------------------------------------------------");
    log("Deploying RateSetter and waiting for confirmations...");

    const cdpManager = await ethers.getContract("CDPManager", deployer);
    const absPiController = await ethers.getContract("AbsPiController", deployer);
    const cpiController = await ethers.getContract("CPIController", deployer);

    const rateSetter = await deploy("RateSetter", {
        from: deployer,
        args: [
            multiSigWalletAddress,
            cdpManager.address,
            absPiController.address,
            cpiController.address,
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
            cpiController.address,
            cpiDataFeedAddress,
        ]);
    }
};

module.exports.tags = ["all", "ratesetter"];
