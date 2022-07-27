const { getNamedAccounts, deployments, network } = require("hardhat");
const { networkConfig, developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    const name = "ResistanceProtocol";
    const symbol = "NOI";
    const chainId = network.config.chainId;

    log("----------------------------------------------------");
    log("Deploying NOI and waiting for confirmations...");
    const noi = await deploy("NOI", {
        from: deployer,
        args: [name, symbol, chainId],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });
    log(`NOI deployed at ${noi.address}`);

    // verify contract on etherscan
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(noi.address, [name, symbol, chainId]);
    }
};

module.exports.tags = ["all", "noi"];
