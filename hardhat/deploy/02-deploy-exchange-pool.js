const { network, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    // getContract gets the most recent deployment for the specified contract
    const coinAddress = (await ethers.getContract("NOI", deployer)).address;

    log("----------------------------------------------------");
    log("Deploying ExchangePool and waiting for confirmations...");
    const ExchangePool = await deploy("ExchangePool", {
        from: deployer,
        args: [coinAddress],
        log: true,
        // wait if on a live network so we can verify properly
        waitConfirmations: network.config.blockConfirmations || 1,
    });
    log(`ExchangePool deployed at ${ExchangePool.address}`);

    // verify contract on etherscan
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(ExchangePool.address, [coinAddress]);
    }
};

module.exports.tags = ["all", "exchangepool"];
