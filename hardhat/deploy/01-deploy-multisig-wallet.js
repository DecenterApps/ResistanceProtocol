const { getNamedAccounts, deployments, network } = require("hardhat");
const { networkConfig, developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    const owners = [];

    owners.push((await ethers.getSigners())[0].address);
    owners.push((await ethers.getSigners())[1].address);
    owners.push((await ethers.getSigners())[2].address);

    log("----------------------------------------------------");
    log("Deploying MultiSigWallet and waiting for confirmations...");
    const msw = await deploy("MultiSigWallet", {
        from: deployer,
        args: [owners],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });
    log(`MultiSigWallet deployed at ${msw.address}`);

    // verify contract on etherscan
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(msw.address, [owners]);
    }
};

module.exports.tags = ["all", "multisigwallet"];
