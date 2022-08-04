const { getNamedAccounts, deployments, network, ethers } = require("hardhat");
const { networkConfig, developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    const multiSigWalletAddress = (await ethers.getContract("MultiSigWallet", deployer)).address;

    log("----------------------------------------------------");
    log("Deploying Liquidator and waiting for confirmations...");
    const Liquidator = await deploy("Liquidator", {
        from: deployer,
        args: [multiSigWalletAddress],
        log: true,
        // wait if on a live network so we can verify properly
        waitConfirmations: network.config.blockConfirmations || 1,
    });
    log(`Liquidator deployed at ${Liquidator.address}`);

    // verify contract on etherscan
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(Liquidator.address, [multiSigWalletAddress]);
    }
};

module.exports.tags = ["all", "liquidator"];