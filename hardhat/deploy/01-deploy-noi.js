const { getNamedAccounts, deployments, network } = require("hardhat");
const { networkConfig, developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    const multiSigWalletAddress = (await ethers.getContract("MultiSigWallet", deployer)).address;

    log("----------------------------------------------------");
    log("Deploying NOI and waiting for confirmations...");
    const noi = await deploy("NOI", {
        from: deployer,
        args: [multiSigWalletAddress],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });
    log(`NOI deployed at ${noi.address}`);

    // verify contract on etherscan
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(noi.address, [multiSigWalletAddress]);
    }
};

module.exports.tags = ["all", "noi"];
