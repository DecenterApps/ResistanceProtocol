const { getNamedAccounts, deployments, network, ethers } = require("hardhat");
const { networkConfig, developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    // getContract gets the most recent deployment for the specified contract
    let coinAddress = (await ethers.getContractAt("NOI", deployer)).address;

    log("----------------------------------------------------");
    log("Deploying CDPManager and waiting for confirmations...");
    const CDPManager = await deploy("CDPManager", {
        from: deployer,
        args: [coinAddress],
        log: true,
        // wait if on a live network so we can verify properly
        waitConfirmations: network.config.blockConfirmations || 1,
    });
    log(`CDPManager deployed at ${CDPManager.address}`);

    // verify contract on etherscan
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(CDPManager.address, [coinAddress]);
    }
};

module.exports.tags = ["all", "cdpmanager"];
