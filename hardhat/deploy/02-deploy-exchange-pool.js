const { network, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    // getContract gets the most recent deployment for the specified contract
    const noiAddress = (await ethers.getContract("NOI", deployer)).address;
    const multiSigWalletAddress = (await ethers.getContract("MultiSigWallet", deployer)).address;
    const daiAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";        //mainnet address; for Kovan is different
    const routerAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";     //same for mainnet and kovan

    log("----------------------------------------------------");
    log("Deploying ExchangePool and waiting for confirmations...");
    const ExchangePool = await deploy("ExchangePool", {
        from: deployer,
        args: [multiSigWalletAddress, noiAddress, daiAddress, routerAddress],
        log: true,
        // wait if on a live network so we can verify properly
        waitConfirmations: network.config.blockConfirmations || 1,
    });
    log(`ExchangePool deployed at ${ExchangePool.address}`);

    // verify contract on etherscan
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(ExchangePool.address, [multiSigWalletAddress,noiAddress, daiAddress, routerAddress]);
    }
};

module.exports.tags = ["all", "exchangepool"];
