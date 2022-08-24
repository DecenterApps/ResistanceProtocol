const { getNamedAccounts, deployments, network, ethers } = require("hardhat");
const { networkConfig, developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    // getContract gets the most recent deployment for the specified contract
    //const coinAddress = (await ethers.getContract("NOI", deployer)).address;

    const multiSigWalletAddress = (await ethers.getContract("MultiSigWallet", deployer)).address;

    log("----------------------------------------------------");
    log("Deploying ShutdownModule and waiting for confirmations...");
    const ShutdownModule = await deploy("ShutdownModule", {
        from: deployer,
        args: [multiSigWalletAddress],
        log: true,
        // wait if on a live network so we can verify properly
        waitConfirmations: network.config.blockConfirmations || 1,
    });
    log(`ShutdownModule deployed at ${ShutdownModule.address}`);

    // verify contract on etherscan
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(ShutdownModule.address, [multiSigWalletAddress]);
    }
};

module.exports.tags = ["all", "shutdown"];
